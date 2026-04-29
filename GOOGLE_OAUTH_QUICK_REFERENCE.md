 CVEGOA
QUICK REFERENCE: Google OAuth Setup
=====================================

OK CHECKLIST RÁPIDO
=======
📋 QUICK REFERENCE: Google OAuth Setup
=====================================

✅ CHECKLIST RÁPIDO
 main

- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google+ API
- [ ] Configurar pantalla de consentimiento OAuth
- [ ] Crear credenciales (Client ID + Secret)
- [ ] Copiar credenciales a Backend/.env
- [ ] Verificar configuración con npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 CVEGOA
VARIABLES REQUERIDAS EN .env
=======
🔧 VARIABLES REQUERIDAS EN .env
 main

GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 CVEGOA
DOCUMENTACIÓN COMPLETA
=======
📖 DOCUMENTACIÓN COMPLETA
 main

Ver: ../GOOGLE_OAUTH_SETUP.md

Para instrucciones paso a paso sobre cómo:
- Acceder a Google Cloud Console
- Crear proyecto
- Habilitar APIs
- Generar credenciales
- Configurar URIs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 CVEGOA
VALIDAR CONFIGURACIÓN

1. Asegúrate que Backend/.env contiene las 3 variables
2. Ejecuta: npm run dev
3. Deberías ver: [OK] Google OAuth configuration loaded successfully

Si ves advertencia: [AVISO] Google OAuth not yet configured
  -> Completa las variables en .env y reinicia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARCHIVOS RELACIONADOS
=======
🧪 VALIDAR CONFIGURACIÓN

1. Asegúrate que Backend/.env contiene las 3 variables
2. Ejecuta: npm run dev
3. Deberías ver: ✓ Google OAuth configuration loaded successfully

Si ves advertencia: ⚠ Google OAuth not yet configured
  → Completa las variables en .env y reinicia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 ARCHIVOS RELACIONADOS
 main

Backend/src/config/google.config.js
  ↳ Configuración centralizada y validación

Backend/.env.example
  ↳ Template con todas las variables

Backend/README.md (sección "Configuración de Google OAuth")
  ↳ Documentación en el README

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 CVEGOA
IMPORTANTE
=======
⚠️ IMPORTANTE
 main

- NUNCA commitees Backend/.env con credenciales reales
- Solo GOOGLE_CLIENT_ID puede ser público
- GOOGLE_CLIENT_SECRET debe mantenerse secreto
- En producción, usa variables de entorno del servidor (Heroku, GCP, AWS, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 CVEGOA
NEXT STEPS
=======
💡 NEXT STEPS
 main

1. Completar credenciales de Google en Backend/.env
2. Implementar endpoints en Backend/routes/auth.routes.js:
   - GET /api/auth/google/callback
   - POST /api/auth/google/login
3. Integración con frontend (sin tocar archivos del frontend)
