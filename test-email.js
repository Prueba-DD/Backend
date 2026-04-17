#!/usr/bin/env node

/**
 * Script de prueba para envío de correo de bienvenida
 * USO: node test-email.js
 * 
 * Requiere variables .env configuradas:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * - FRONTEND_URL (opcional)
 */

import 'dotenv/config';
import { enviarCorreoBienvenida } from './src/services/email.service.js';

const testEmail = async () => {
  console.log('🧪 Iniciando prueba de correo de bienvenida...\n');

  // Datos de prueba (cámbia de acuerdo a tu necesidad)
  const testUser = {
    email: process.env.TEST_EMAIL || 'test@ejemplo.com',
    nombre: 'Test',
    apellido: 'Usuario',
  };

  console.log('📧 Enviando correo a:', testUser.email);
  console.log('📝 Nombre:', `${testUser.nombre} ${testUser.apellido}`);
  console.log('\n⏳ Procesando...\n');

  try {
    const result = await enviarCorreoBienvenida(
      testUser.email,
      testUser.nombre,
      testUser.apellido
    );

    if (result) {
      console.log('✅ ÉXITO: Correo de bienvenida enviado correctamente');
      console.log('📬 El usuario debería recibir el correo en minutos\n');
    } else {
      console.log('⚠️ ADVERTENCIA: No se pudo enviar el correo');
      console.log('📋 Revisa la consola para más detalles\n');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n🔍 Posibles soluciones:');
    console.log('1. Verifica que SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS estén en .env');
    console.log('2. Confirma que el servicio SMTP está disponible');
    console.log('3. Comprueba credenciales (usuario/contraseña correctos)');
    console.log('4. Para desarrollo, usa https://mailtrap.io (prueba gratuita)\n');
  }

  process.exit(0);
};

testEmail();
