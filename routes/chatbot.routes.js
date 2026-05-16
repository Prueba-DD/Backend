import { Router } from 'express';
import {
  enviarMensajeChatbot,
  obtenerFaqsChatbot,
} from '../src/controllers/chatbot.controller.js';

const chatbotRouter = Router();

chatbotRouter.post('/mensaje', enviarMensajeChatbot);
chatbotRouter.get('/faqs', obtenerFaqsChatbot);

export default chatbotRouter;
