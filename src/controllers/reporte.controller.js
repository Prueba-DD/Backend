import {
  ESTADO_INICIAL_REPORTE,
  ESTADOS_REPORTE_PERMITIDOS,
  NIVELES_SEVERIDAD_PERMITIDOS,
  ReporteModel,
} from '../models/reporte.model.js';
import { CategoriaRiesgoModel } from '../models/categoria-riesgo.model.js';
import { UsuarioModel }   from '../models/usuario.model.js';
import { EvidenciaModel } from '../models/evidencia.model.js';
import { errorResponse, successResponse } from '../utils/response.js';

const parseCoordinate = (value, { field, min, max }) => {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return {
      error: `${field} debe ser un numero valido.`,
    };
  }

  if (parsed < min || parsed > max) {
    return {
      error: `${field} debe estar entre ${min} y ${max}.`,
    };
  }

  return { value: parsed };
};

const normalizeEnumValue = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : ''
);

const buildAllowedValuesMessage = (field, allowedValues) => (
  `${field} debe ser uno de: ${allowedValues.join(', ')}.`
);

const canManageReporteEvidence = (reporte, user) => {
  if (!reporte || !user) {
    return false;
  }

  return (
    Number(reporte.id_usuario) === Number(user.sub) ||
    user.rol === 'moderador' ||
    user.rol === 'admin'
  );
};

const getReporteForEvidenceManagement = async (req, res) => {
  const id = Number(req.params.id);
  const reporte = await ReporteModel.findById(id);

  if (!reporte) {
    errorResponse(res, 'Reporte no encontrado.', 404);
    return null;
  }

  if (!canManageReporteEvidence(reporte, req.user)) {
    errorResponse(res, 'No tienes permiso para gestionar evidencias de este reporte.', 403);
    return null;
  }

  return reporte;
};

const toCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  const escaped = raw.replace(/"/g, '""');
  return /[",\n\r]/.test(raw) ? `"${escaped}"` : escaped;
};

const normalizeHasta = (value) => {
  if (!value) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value} 23:59:59` : value;
};

const parseAnalyticsLimit = (value, defaultValue = 12, maxValue = 60) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return Math.max(1, Math.min(maxValue, parsed));
};

export const createReporte = async (req, res, next) => {
  try {
    const {
      tipo_contaminacion,
      nivel_severidad,
      titulo,
      descripcion,
      direccion,
      municipio,
      departamento,
      latitud,
      longitud,
    } = req.body ?? {};

    if (!tipo_contaminacion?.trim()) {
      return errorResponse(res, 'El tipo de contaminación es requerido.', 400);
    }
    if (!nivel_severidad?.trim()) {
      return errorResponse(res, 'El nivel de severidad es requerido.', 400);
    }
    if (!titulo?.trim() || titulo.trim().length < 5) {
      return errorResponse(res, 'El título debe tener al menos 5 caracteres.', 400);
    }
    if (!direccion?.trim() || direccion.trim().length < 3) {
      return errorResponse(res, 'La dirección es requerida.', 400);
    }

    const tipoContaminacion = tipo_contaminacion.trim().toLowerCase();
    const nivelSeveridad = normalizeEnumValue(nivel_severidad);

    if (!NIVELES_SEVERIDAD_PERMITIDOS.includes(nivelSeveridad)) {
      return errorResponse(
        res,
        buildAllowedValuesMessage('El nivel de severidad', NIVELES_SEVERIDAD_PERMITIDOS),
        400
      );
    }

    const categoriaValida = await CategoriaRiesgoModel.esValido(tipoContaminacion);

    if (!categoriaValida) {
      return errorResponse(res, 'La categoría de contaminación no existe o está inactiva.', 400);
    }

    const parsedLatitud = parseCoordinate(latitud, {
      field: 'La latitud',
      min: -90,
      max: 90,
    });

    if (parsedLatitud.error) {
      return errorResponse(res, parsedLatitud.error, 400);
    }

    const parsedLongitud = parseCoordinate(longitud, {
      field: 'La longitud',
      min: -180,
      max: 180,
    });

    if (parsedLongitud.error) {
      return errorResponse(res, parsedLongitud.error, 400);
    }

    const idReporte = await ReporteModel.create({
      id_usuario:       req.user.sub,
      tipo_contaminacion: tipoContaminacion,
      nivel_severidad:    nivelSeveridad,
      titulo:             titulo.trim(),
      descripcion:        descripcion?.trim() || null,
      direccion:          direccion.trim(),
      municipio:          municipio?.trim() || null,
      departamento:       departamento?.trim() || null,
      latitud:            parsedLatitud.value,
      longitud:           parsedLongitud.value,
    });

    const reporte = await ReporteModel.findById(idReporte);

    // Guardar evidencia si se adjuntó archivo
    if (req.file) {
      const tipo = req.file.mimetype.startsWith('video/') ? 'video' : 'imagen';
      await EvidenciaModel.create({
        id_reporte:      idReporte,
        id_usuario:      req.user.sub,
        tipo_archivo:    tipo,
        url_archivo:     `/uploads/${req.file.filename}`,
        nombre_original: req.file.originalname,
        mime_type:       req.file.mimetype,
        tamano_bytes:    req.file.size,
        orden:           0,
      });
    }

    return successResponse(res, { reporte }, 'Reporte creado correctamente.', 201);
  } catch (error) {
    return next(error);
  }
};

export const getReportes = async (req, res, next) => {
  try {
    const { estado, tipo_contaminacion, nivel_severidad, municipio, limit = 20, offset = 0 } = req.query;
    const reportes = await ReporteModel.findAll({
      estado, tipo_contaminacion, nivel_severidad, municipio,
      limit: Number(limit),
      offset: Number(offset),
    });
    return successResponse(res, { reportes, total: reportes.length });
  } catch (error) {
    return next(error);
  }
};

export const exportReportes = async (req, res, next) => {
  try {
    const {
      format,
      tipo_contaminacion,
      estado,
      nivel_severidad,
      municipio,
      desde,
      hasta,
    } = req.query ?? {};

    const reportes = await ReporteModel.findForExport({
      tipo_contaminacion,
      estado,
      nivel_severidad,
      municipio,
      desde,
      hasta: normalizeHasta(hasta),
    });

    if (String(format).toLowerCase() === 'json') {
      return successResponse(
        res,
        { reportes },
        'Exportacion de reportes generada correctamente.'
      );
    }

    const headers = [
      'titulo',
      'tipo_contaminacion',
      'nivel_severidad',
      'estado',
      'municipio',
      'autor_nombre',
      'autor_apellido',
      'created_at',
    ];

    const csvRows = [
      headers.join(','),
      ...reportes.map((row) => headers.map((key) => toCsvValue(row[key])).join(',')),
    ];

    const csvContent = `\ufeff${csvRows.join('\n')}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reportes_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
};

export const getMisReportes = async (req, res, next) => {
  try {
    const id_usuario = req.user?.sub;

    if (!id_usuario) {
      return errorResponse(res, 'No autorizado.', 401);
    }

    const { limit = 20, offset = 0 } = req.query;

    const reportes = await ReporteModel.findByUsuario(id_usuario, {
      limit: Number(limit),
      offset: Number(offset),
    });

    const total = await ReporteModel.countByUsuario(id_usuario);

    return successResponse(
      res,
      { reportes, total },
      'Reportes del usuario obtenidos correctamente.',
      200
    );
  } catch (error) {
    return next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await ReporteModel.getStats();
    return successResponse(res, { stats });
  } catch (error) {
    return next(error);
  }
};

export const getStatsByCategoria = async (req, res, next) => {
  try {
    const data = await ReporteModel.getStatsByCategoria();
    return successResponse(
      res,
      { data, total: data.length },
      'Estadisticas por categoria obtenidas correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};

export const getStatsTimeline = async (req, res, next) => {
  try {
    const bucket = String(req.query.bucket ?? 'week').toLowerCase();

    if (!['week', 'month'].includes(bucket)) {
      return errorResponse(res, 'El parametro bucket debe ser week o month.', 400);
    }

    const limit = parseAnalyticsLimit(req.query.limit);
    const data = await ReporteModel.getStatsTimeline({ bucket, limit });

    return successResponse(
      res,
      { data, bucket, limit, total: data.length },
      'Timeline de reportes obtenido correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};

export const getHeatmapPoints = async (req, res, next) => {
  try {
    const data = await ReporteModel.getHeatmapPoints();
    return successResponse(
      res,
      { data, total: data.length },
      'Puntos de heatmap obtenidos correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};

export const updateReporte = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reporte = await ReporteModel.findById(id);
    if (!reporte) return errorResponse(res, 'Reporte no encontrado.', 404);

    const { rol, sub } = req.user;
    const isOwner = reporte.id_usuario === sub;
    const isMod   = rol === 'moderador' || rol === 'admin';

    if (!isOwner && !isMod) {
      return errorResponse(res, 'No tienes permiso para editar este reporte.', 403);
    }

    // Owners solo pueden editar reportes en estado inicial.
    if (isOwner && !isMod && reporte.estado !== ESTADO_INICIAL_REPORTE) {
      return errorResponse(
        res,
        'No puedes editar un reporte que ya está en revisión o procesado.',
        403
      );
    }

    // Owners can edit content fields; mods/admins can also change estado y comentario_moderacion
    const allowed = isOwner
      ? ['titulo', 'descripcion', 'direccion', 'municipio', 'departamento']
      : ['estado', 'nivel_severidad', 'titulo', 'descripcion', 'direccion', 'municipio', 'departamento', 'comentario_moderacion'];

    const campos = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body ?? {}, key)) {
        campos[key] = req.body[key];
      }
    }

    if (Object.keys(campos).length === 0) {
      return errorResponse(res, 'No se enviaron campos válidos para actualizar.', 400);
    }

    if (Object.prototype.hasOwnProperty.call(campos, 'estado')) {
      const estado = normalizeEnumValue(campos.estado);

      if (!ESTADOS_REPORTE_PERMITIDOS.includes(estado)) {
        return errorResponse(
          res,
          buildAllowedValuesMessage('El estado', ESTADOS_REPORTE_PERMITIDOS),
          400
        );
      }

      campos.estado = estado;
    }

    if (Object.prototype.hasOwnProperty.call(campos, 'nivel_severidad')) {
      const nivelSeveridad = normalizeEnumValue(campos.nivel_severidad);

      if (!NIVELES_SEVERIDAD_PERMITIDOS.includes(nivelSeveridad)) {
        return errorResponse(
          res,
          buildAllowedValuesMessage('El nivel de severidad', NIVELES_SEVERIDAD_PERMITIDOS),
          400
        );
      }

      campos.nivel_severidad = nivelSeveridad;
    }

    // Validar que comentario_moderacion es obligatorio si se rechaza
    if (isMod && campos.estado === 'rechazado') {
      const comentario = campos.comentario_moderacion?.trim();
      if (!comentario) {
        return errorResponse(res, 'El comentario es obligatorio al rechazar un reporte.', 400);
      }
    }

    await ReporteModel.update(id, campos);
    const updated = await ReporteModel.findById(id);
    return successResponse(res, { reporte: updated }, 'Reporte actualizado.');
  } catch (error) {
    return next(error);
  }
};

export const deleteReporte = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reporte = await ReporteModel.findById(id);
    if (!reporte) return errorResponse(res, 'Reporte no encontrado.', 404);

    const { rol, sub } = req.user;
    const isOwner = reporte.id_usuario === sub;
    const isMod   = rol === 'moderador' || rol === 'admin';

    if (!isOwner && !isMod) {
      return errorResponse(res, 'No tienes permiso para eliminar este reporte.', 403);
    }

    // Owners solo pueden eliminar reportes en estado inicial.
    if (isOwner && !isMod && reporte.estado !== ESTADO_INICIAL_REPORTE) {
      return errorResponse(
        res,
        'No puedes eliminar un reporte que ya está en revisión o procesado.',
        403
      );
    }

    await ReporteModel.remove(id);
    return successResponse(res, null, 'Reporte eliminado.');
  } catch (error) {
    return next(error);
  }
};

export const getReporteById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reporte = await ReporteModel.findById(id);
    if (!reporte) return errorResponse(res, 'Reporte no encontrado.', 404);
    await ReporteModel.incrementarVistas(id);

    // Fetch related data in parallel
    const [evidencias, usuario] = await Promise.all([
      EvidenciaModel.findByReporte(id),
      UsuarioModel.findById(reporte.id_usuario),
    ]);

    // Strip sensitive user fields
    const autor = usuario
      ? { nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol, avatar_url: usuario.avatar_url ?? null }
      : null;

    return successResponse(res, { reporte, evidencias, autor });
  } catch (error) {
    return next(error);
  }
};

export const listEvidenciasReporte = async (req, res, next) => {
  try {
    const reporte = await getReporteForEvidenceManagement(req, res);
    if (!reporte) return null;

    const evidencias = await EvidenciaModel.findByReporte(reporte.id_reporte);

    return successResponse(
      res,
      { evidencias, total: evidencias.length },
      'Evidencias obtenidas correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};

export const addEvidenciaReporte = async (req, res, next) => {
  try {
    const reporte = await getReporteForEvidenceManagement(req, res);
    if (!reporte) return null;

    if (!req.file) {
      return errorResponse(res, 'Archivo de evidencia requerido.', 400);
    }

    const tipo = req.file.mimetype.startsWith('video/') ? 'video' : 'imagen';
    const idEvidencia = await EvidenciaModel.create({
      id_reporte: reporte.id_reporte,
      id_usuario: req.user.sub,
      tipo_archivo: tipo,
      url_archivo: `/uploads/${req.file.filename}`,
      nombre_original: req.file.originalname,
      mime_type: req.file.mimetype,
      tamano_bytes: req.file.size,
      orden: 0,
    });

    const evidencia = await EvidenciaModel.findById(idEvidencia);

    return successResponse(
      res,
      { evidencia },
      'Evidencia agregada correctamente.',
      201
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteEvidenciaReporte = async (req, res, next) => {
  try {
    const reporte = await getReporteForEvidenceManagement(req, res);
    if (!reporte) return null;

    const evidenciaId = Number(req.params.evidenciaId);
    const evidencia = await EvidenciaModel.findById(evidenciaId);

    if (!evidencia || Number(evidencia.id_reporte) !== Number(reporte.id_reporte)) {
      return errorResponse(res, 'Evidencia no encontrada.', 404);
    }

    await EvidenciaModel.remove(evidenciaId);

    return successResponse(res, null, 'Evidencia eliminada correctamente.');
  } catch (error) {
    return next(error);
  }
};
