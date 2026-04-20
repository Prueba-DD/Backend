import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
	register,
	login,
	forgotPassword,
	resetPassword,
	getPerfil,
	updatePerfil,
	changePassword,
	enviarVerificacionOtp,
	verificarEmailOtp,
} from '../src/controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/perfil', verifyToken, getPerfil);
authRouter.patch('/perfil', verifyToken, updatePerfil);
authRouter.patch('/cambiar-contrasena', verifyToken, changePassword);
authRouter.post('/enviar-verificacion', verifyToken, enviarVerificacionOtp);
authRouter.post('/verificar-email', verifyToken, verificarEmailOtp);

export default authRouter;
