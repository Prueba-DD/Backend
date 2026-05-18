import { NotificacionModel } from '../models/notificacion.model.js';
import { errorResponse, successResponse } from '../utils/response.js';

export const crearNotificacion = async (payload) => {
  try {
    return await NotificacionModel.create(payload);
  } catch (error) {
    console.error('[notificaciones] error al crear:', error.message);
    return null;
  }
};

export const listarNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.user?.sub;
    if (!idUsuario) return errorResponse(res, 'No autorizado.', 401);

    const filtroLeida = req.query?.leida === 'true'
      ? true
      : req.query?.leida === 'false'
        ? false
        : undefined;

    const data = await NotificacionModel.findByUsuario(idUsuario, {
      leida: filtroLeida,
      limit: req.query?.limit,
      offset: req.query?.offset,
    });

    res.setHeader('Cache-Control', 'no-store');
    return successResponse(res, data, 'Notificaciones obtenidas.');
  } catch (error) {
    return next(error);
  }
};

export const contadorNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.user?.sub;
    if (!idUsuario) return errorResponse(res, 'No autorizado.', 401);

    const no_leidas = await NotificacionModel.contarNoLeidas(idUsuario);

    res.setHeader('Cache-Control', 'no-store');
    return successResponse(res, { no_leidas }, 'ok');
  } catch (error) {
    return next(error);
  }
};

export const marcarLeida = async (req, res, next) => {
  try {
    const idUsuario = req.user?.sub;
    if (!idUsuario) return errorResponse(res, 'No autorizado.', 401);

    const { uuid } = req.params;
    if (!uuid) return errorResponse(res, 'UUID requerido.', 400);

    const ok = await NotificacionModel.marcarLeida(uuid, idUsuario);
    if (!ok) return errorResponse(res, 'Notificacion no encontrada.', 404);

    return successResponse(res, { uuid }, 'Notificacion marcada como leida.');
  } catch (error) {
    return next(error);
  }
};

export const marcarTodasLeidas = async (req, res, next) => {
  try {
    const idUsuario = req.user?.sub;
    if (!idUsuario) return errorResponse(res, 'No autorizado.', 401);

    const actualizadas = await NotificacionModel.marcarTodasLeidas(idUsuario);

    return successResponse(
      res,
      { actualizadas },
      'Notificaciones marcadas como leidas.'
    );
  } catch (error) {
    return next(error);
  }
};

export const eliminarNotificacion = async (req, res, next) => {
  try {
    const idUsuario = req.user?.sub;
    if (!idUsuario) return errorResponse(res, 'No autorizado.', 401);

    const { uuid } = req.params;
    if (!uuid) return errorResponse(res, 'UUID requerido.', 400);

    const ok = await NotificacionModel.eliminar(uuid, idUsuario);
    if (!ok) return errorResponse(res, 'Notificacion no encontrada.', 404);

    return successResponse(res, { uuid }, 'Notificacion eliminada.');
  } catch (error) {
    return next(error);
  }
};
