import { ReporteModel } from '../models/reporte.model.js';
import {
  calcularAlertasPredictivas,
  parseAlertasParams,
} from './prediccion.service.js';

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const construirContextoChatbot = async ({ user, lat, lng } = {}) => {
  const userId = user?.sub;
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);

  const [global, usuario, alertasPayload] = await Promise.all([
    ReporteModel.getStats().catch(() => ({})),
    userId
      ? Promise.all([
        ReporteModel.findByUsuario(userId, { limit: 5, offset: 0 }).catch(() => []),
        ReporteModel.countByUsuario(userId).catch(() => 0),
      ]).then(([reportes, total]) => ({ reportes, total_reportes: Number(total) || 0 }))
      : Promise.resolve(null),
    calcularAlertasPredictivas(parseAlertasParams({
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      radio_km: latitude !== null && longitude !== null ? 25 : undefined,
      limite: 3,
      min_score: 0,
      nivel_min: 'medio',
    })).catch(() => ({ alertas: [] })),
  ]);

  return {
    global,
    usuario,
    alertasZona: alertasPayload.alertas || [],
  };
};
