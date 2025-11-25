# 🔧 Variables de Entorno para Web App (Next.js)

Estas variables deben agregarse en Render para el servicio **pickgenius-web**

## Variables NEXT_PUBLIC (Frontend)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

## Dónde Encontrar los Valores de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en ⚙️ **Project Settings**
4. Scroll hasta **Your apps** → **Web app**
5. Copia los valores del `firebaseConfig`

## Variable de API (Auto-configurada)

Render configurará automáticamente:
```bash
NEXT_PUBLIC_API_URL=https://pickgenius-api.onrender.com
```

Esta variable se llena automáticamente desde el servicio `pickgenius-api` gracias al `render.yaml`.
