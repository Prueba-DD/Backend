import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFoundHandler, errorHandler } from '../middlewares/errorHandler.js';
import healthRouter from '../routes/health.routes.js';
import authRouter from '../routes/auth.routes.js';
import reporteRouter from '../routes/reporte.routes.js';
import categoriaRouter from '../routes/categoria-riesgo.routes.js';
import adminRouter from '../routes/admin.routes.js';
import { getCorsOptions, getHelmetOptions } from './config/security.config.js';
import { getUploadDir } from './config/upload.config.js';

const app = express();
const normalizeApiPrefix = (prefix = '/api') => {
  const trimmedPrefix = prefix.trim();
  const withLeadingSlash = trimmedPrefix.startsWith('/') ? trimmedPrefix : `/${trimmedPrefix}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/api';
};

const apiPrefix = normalizeApiPrefix(process.env.API_PREFIX);

app.use(helmet(getHelmetOptions()));
app.use(cors(getCorsOptions()));
app.options('*', cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos subidos por los usuarios
app.use('/uploads', express.static(getUploadDir()));

// rutas de la API
app.use(`${apiPrefix}/health`, healthRouter);
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/reportes`, reporteRouter);
app.use(`${apiPrefix}/categorias`, categoriaRouter);
app.use(`${apiPrefix}/admin`, adminRouter);

 
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
