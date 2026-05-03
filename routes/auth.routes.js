import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
	register,
	login,
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

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/perfil', verifyToken, getPerfil);
authRouter.patch('/perfil', verifyToken, updatePerfil);
authRouter.patch('/cambiar-contrasena', verifyToken, changePassword);
authRouter.patch('/notificaciones', verifyToken, updateNotifications);

// Rutas para verificación de email con OTP
authRouter.post('/enviar-verificacion', verifyToken, sendVerificationOtp);
authRouter.post('/verificar-email', verifyToken, verifyEmailOtp);

// Rutas para autenticación con Google OAuth
authRouter.get('/google/url', getGoogleAuthUrl);
authRouter.post('/google/login', googleLogin);
authRouter.get('/google/callback', googleCallback);

// Rutas para autenticacion con Facebook OAuth (Authorization Code Flow)
authRouter.get('/facebook/url', getFacebookAuthUrl);
authRouter.get('/facebook/callback', facebookCallback);

export default authRouter;
