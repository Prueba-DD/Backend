import { Router } from 'express';
import { verifyToken, requireRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { createReporte, getReportes, getReporteById, getStats, getMisReportes, updateReporte, deleteReporte, exportReportes } from '../src/controllers/reporte.controller.js';
 

const reporteRouter = Router();

reporteRouter.get('/stats', getStats);
reporteRouter.get('/export', verifyToken, requireRoles('admin', 'moderador'), exportReportes);
reporteRouter.get('/mis-reportes', verifyToken, getMisReportes);
reporteRouter.get('/',      getReportes);
reporteRouter.get('/:id',   getReporteById);
reporteRouter.post('/',     verifyToken, upload.single('file'), createReporte);
reporteRouter.patch('/:id', verifyToken, updateReporte);
reporteRouter.delete('/:id', verifyToken, deleteReporte);

export default reporteRouter;
