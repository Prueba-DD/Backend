import { ReporteModel } from '../models/reporte.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

const FAQ_GROUPS = [
  {
    titulo: 'Reportes',
    items: [
      {
        pregunta: 'Como crear un reporte ambiental?',
        prompt: 'Como creo un reporte ambiental?',
      },
      {
        pregunta: 'Que evidencia puedo adjuntar?',
        prompt: 'Que evidencia puedo adjuntar a un reporte?',
      },
      {
        pregunta: 'Como reviso el estado de mi reporte?',
        prompt: 'Como reviso el estado de mi reporte?',
      },
    ],
  },
  {
    titulo: 'Alertas',
    items: [
      {
        pregunta: 'Que son las zonas de riesgo?',
        prompt: 'Que son las zonas de riesgo predictivas?',
      },
      {
        pregunta: 'Como activar alertas en mi zona?',
        prompt: 'Como activo alertas en mi zona?',
      },
    ],
  },
  {
    titulo: 'Cuenta',
    items: [
      {
        pregunta: 'Como verifico mi correo?',
        prompt: 'Como verifico mi correo electronico?',
      },
      {
        pregunta: 'Como recupero mi contrasena?',
        prompt: 'Como recupero mi contrasena?',
      },
    ],
  },
];

const detectIntent = (mensaje) => {
  const text = String(mensaje || '').toLowerCase();
  if (/reporte|denuncia|evidencia|foto|crear|enviar/.test(text)) return 'reportes';
  if (/alerta|riesgo|zona|mapa|predic/.test(text)) return 'alertas';
  if (/correo|verific|otp|codigo/.test(text)) return 'verificacion';
  if (/contrase|password|recuper/.test(text)) return 'recuperacion';
  if (/estado|seguimiento|moderacion|revision/.test(text)) return 'seguimiento';
  return 'fallback';
};

const buildRespuesta = (intent, stats) => {
  const totalReportes = Number(stats?.total_reportes) || 0;
  const municipios = Number(stats?.municipios_activos) || 0;

  const responses = {
    reportes: `Para crear un reporte entra a "Nuevo reporte", selecciona la categoria, severidad, descripcion, ubicacion y adjunta evidencias si las tienes. La plataforma registra el reporte y lo deja en estado pendiente para revision.`,
    alertas: `Las zonas de riesgo se calculan con reportes recientes, severidad y concentracion geografica. Actualmente hay ${totalReportes} reportes registrados en ${municipios} municipio(s) activo(s).`,
    verificacion: 'Despues del registro enviamos un codigo de 6 digitos al correo. En la pantalla "Verifica tu correo" puedes ingresarlo o solicitar un nuevo codigo cuando termine el contador.',
    recuperacion: 'Para recuperar tu contrasena usa "Olvidaste tu contrasena", escribe tu correo y abre el enlace recibido. El enlace expira por seguridad.',
    seguimiento: 'Puedes revisar el estado en "Mis reportes". Los moderadores pueden cambiar un reporte entre pendiente, en revision, verificado, en proceso, resuelto o rechazado.',
    fallback: 'Puedo ayudarte con reportes ambientales, verificacion de correo, recuperacion de contrasena, alertas de riesgo y seguimiento de reportes.',
  };

  return responses[intent] || responses.fallback;
};

const buildSuggestions = (intent) => {
  const common = [
    'Como crear un reporte ambiental?',
    'Como verifico mi correo?',
    'Que son las zonas de riesgo?',
  ];

  if (intent === 'reportes') {
    return ['Que evidencia puedo adjuntar?', 'Como edito un reporte?', 'Como veo mis reportes?'];
  }

  if (intent === 'alertas') {
    return ['Como activar alertas en mi zona?', 'Que significa riesgo critico?', 'Como se calcula el mapa?'];
  }

  return common;
};

export const enviarMensajeChatbot = async (req, res, next) => {
  const startedAt = Date.now();
  try {
    const { mensaje, sessionId } = req.body ?? {};
    const cleanMessage = typeof mensaje === 'string' ? mensaje.trim() : '';

    if (!cleanMessage) {
      return errorResponse(res, 'El mensaje es requerido.', 400);
    }

    const [stats, zonas] = await Promise.all([
      ReporteModel.getStats(),
      ReporteModel.getAlertasPredictivas({ limite: 3, nivel_min: 'medio' }).catch(() => []),
    ]);
    const intent = detectIntent(cleanMessage);

    return successResponse(
      res,
      {
        sessionId,
        respuesta: buildRespuesta(intent, stats),
        sugerencias: buildSuggestions(intent),
        cards: zonas.map((zona) => ({
          titulo: `${zona.municipio || 'Zona'} - riesgo ${zona.nivel}`,
          descripcion: `${zona.n_reportes} reporte(s), categoria ${zona.tipo_dominante}`,
          tipo: 'alerta',
          data: zona,
        })),
        estadoAmbiental: zonas.some((zona) => zona.nivel === 'critico' || zona.nivel === 'alto')
          ? 'alerta'
          : 'optimo',
        fuente: 'backend',
        intent,
        latencia_ms: Date.now() - startedAt,
      },
      'Respuesta generada correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};

export const obtenerFaqsChatbot = async (_req, res, next) => {
  try {
    return successResponse(
      res,
      { grupos: FAQ_GROUPS },
      'FAQs obtenidas correctamente.'
    );
  } catch (error) {
    return next(error);
  }
};
