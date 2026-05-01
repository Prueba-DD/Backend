import rateLimit from 'express-rate-limit';

const buildRateLimit = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message,
    },
  });

export const authRateLimit = buildRateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  message: 'Demasiadas solicitudes de autenticacion. Intenta nuevamente mas tarde.',
});

export const loginRateLimit = buildRateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
  message: 'Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.',
});

export const passwordResetRateLimit = buildRateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_MAX) || 5,
  message: 'Demasiadas solicitudes de recuperacion de contrasena. Intenta mas tarde.',
});

