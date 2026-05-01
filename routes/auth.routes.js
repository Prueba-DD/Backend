import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
	authRateLimit,
	loginRateLimit,
	passwordResetRateLimit,
} from '../middlewares/rateLimit.middleware.js';
import {
	register,
	login,
	refreshAccessToken,
	logout,
	forgotPassword,
	resetPassword,
	verifyEmail,
	getPerfil,
	updatePerfil,
	changePassword,
	sendVerificationOtp,
	verifyEmailOtp,
	updateNotifications,
	googleLogin,
	googleCallback,
	getGoogleAuthUrl,
	facebookCallback,
	getFacebookAuthUrl,
} from '../src/controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', authRateLimit, register);
authRouter.post('/login', loginRateLimit, login);
authRouter.post('/refresh', authRateLimit, refreshAccessToken);
authRouter.post('/logout', authRateLimit, logout);
authRouter.get('/verify-email', authRateLimit, verifyEmail);
authRouter.post('/forgot-password', passwordResetRateLimit, forgotPassword);
authRouter.post('/reset-password', passwordResetRateLimit, resetPassword);
authRouter.get('/perfil', verifyToken, getPerfil);
authRouter.patch('/perfil', verifyToken, updatePerfil);
authRouter.patch('/cambiar-contrasena', passwordResetRateLimit, verifyToken, changePassword);
authRouter.patch('/notificaciones', verifyToken, updateNotifications);

// Rutas para verificación de email con OTP
authRouter.post('/enviar-verificacion', authRateLimit, verifyToken, sendVerificationOtp);
authRouter.post('/verificar-email', authRateLimit, verifyToken, verifyEmailOtp);

// Rutas para autenticación con Google OAuth
authRouter.get('/google/url', getGoogleAuthUrl);
authRouter.post('/google/login', authRateLimit, googleLogin);
authRouter.get('/google/callback', googleCallback);

// Rutas para autenticacion con Facebook OAuth (Authorization Code Flow)
authRouter.get('/facebook/url', getFacebookAuthUrl);
authRouter.get('/facebook/callback', facebookCallback);

export default authRouter;
