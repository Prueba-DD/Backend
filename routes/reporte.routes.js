import { Router } from 'express';
import { verifyToken, requireRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validatePositiveIdParam } from '../middlewares/validate-id.middleware.js';
import {
  createReporte,
  getReportes,
  getReporteById,
  getStats,
  getStatsByCategoria,
  getStatsTimeline,
  getHeatmapPoints,
  getMisReportes,
  updateReporte,
  deleteReporte,
  exportReportes,
  listEvidenciasReporte,
  addEvidenciaReporte,
  deleteEvidenciaReporte,
} from '../src/controllers/reporte.controller.js';
 

const reporteRouter = Router();

reporteRouter.get('/stats', getStats);
reporteRouter.get('/stats/categoria', getStatsByCategoria);
reporteRouter.get('/stats/timeline', getStatsTimeline);
reporteRouter.get('/stats/heatmap', getHeatmapPoints);
reporteRouter.get('/export', verifyToken, requireRoles('admin', 'moderador'), exportReportes);
reporteRouter.get('/mis-reportes', verifyToken, getMisReportes);
reporteRouter.get('/',      getReportes);
reporteRouter.get('/:id/evidencias', validatePositiveIdParam('id'), verifyToken, listEvidenciasReporte);
reporteRouter.post('/:id/evidencias', validatePositiveIdParam('id'), verifyToken, upload.single('file'), addEvidenciaReporte);
reporteRouter.delete(
  '/:id/evidencias/:evidenciaId',
  validatePositiveIdParam('id'),
  validatePositiveIdParam('evidenciaId'),
  verifyToken,
  deleteEvidenciaReporte
);
reporteRouter.get('/:id',   validatePositiveIdParam('id'), getReporteById);
reporteRouter.post('/',     verifyToken, upload.single('file'), createReporte);
reporteRouter.patch('/:id', validatePositiveIdParam('id'), verifyToken, updateReporte);
reporteRouter.delete('/:id', validatePositiveIdParam('id'), verifyToken, deleteReporte);

export default reporteRouter;
