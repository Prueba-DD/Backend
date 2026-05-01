#!/usr/bin/env node

import 'dotenv/config';
import {
  enviarCorreo,
  generarTemplateBaseCorreo,
  verificarConexionSmtp,
} from '../../src/services/email.service.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}${msg}${colors.reset}`),
};

const main = async () => {
  const to = process.env.EMAIL_TEST_TO || process.env.EMAIL_FROM;

  if (!to) {
    throw new Error('Define EMAIL_TEST_TO o EMAIL_FROM en Backend/.env');
  }

  log.info('Validando conexion SMTP...');
  await verificarConexionSmtp();
  log.success('Conexion SMTP valida.');

  log.info(`Enviando correo de prueba a ${to}...`);
  const html = generarTemplateBaseCorreo({
    title: 'Correo de prueba',
    subtitle: 'Configuracion SMTP',
    previewText: 'Prueba local del servicio de correos de GreenAlert.',
    content: `
      <div class="message">
        Este mensaje confirma que Nodemailer puede enviar correos desde el backend de GreenAlert.
      </div>
      <div class="panel">
        <h3>Entorno</h3>
        <ul>
          <li>Proveedor SMTP: ${process.env.EMAIL_HOST}</li>
          <li>Puerto SMTP: ${process.env.EMAIL_PORT}</li>
          <li>Fecha de prueba: ${new Date().toISOString()}</li>
        </ul>
      </div>
    `,
  });

  const info = await enviarCorreo(to, 'GreenAlert - prueba SMTP', html);
  log.success('Correo enviado correctamente.');
  log.info(`Message ID: ${info.messageId}`);
};

main().catch((error) => {
  log.error(`Error en prueba SMTP: ${error.message}`);
  process.exit(1);
});

