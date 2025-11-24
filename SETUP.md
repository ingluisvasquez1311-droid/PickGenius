# 🚀 SETUP - Tirens Parleys

## Paso 1: Rellenar .env

Edita el archivo `.env` y rellena con tus valores:

```env
GOOGLE_CLOUD_PROJECT=tu-proyecto-id
GEMINI_API_KEY=tu-gemini-api-key
FIREBASE_API_KEY=tu-firebase-key
NBA_API_KEY=tu-nba-api-key
RAPID_API_KEY=tu-rapid-api-key
```

## Paso 2: Firebase Credentials

Reemplaza el contenido de `firebase-credentials.json` con tu archivo descargado de Google Cloud.

## Paso 3: Correr Localmente

```bash
npm run dev
```

Visita: http://localhost:3000

## Paso 4: Desplegar en Render

1. Ve a https://render.com
2. Conecta tu repositorio GitHub
3. Agrega las variables de entorno
4. Deploy

## Paso 5: GitHub Actions

Agrega en GitHub Settings > Secrets:
- RENDER_API_KEY
- RENDER_SERVICE_ID
