# Guía Rápida: Desplegar Backend en Render

## Paso 1: Crear Cuenta en Render
1. Ve a https://render.com
2. Haz clic en "Get Started for Free"
3. Regístrate con tu cuenta de GitHub

## Paso 2: Crear Nuevo Web Service
1. En el dashboard de Render, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio: `ingluisvasquez1311-droid/PickGenius`
4. Haz clic en "Connect"

## Paso 3: Configurar el Servicio
Usa la siguiente configuración:

**Name:** `pickgenius-backend`

**Region:** `Oregon (US West)` (o el más cercano a ti)

**Branch:** `main`

**Root Directory:** (dejar vacío)

**Runtime:** `Node`

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Instance Type:** `Free`

## Paso 4: Variables de Entorno
Haz clic en "Advanced" y agrega estas variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SCRAPER_API_KEY` | `tu_clave_de_scraperapi` |
| `PORT` | `10000` |

> **Nota:** Si no tienes ScraperAPI key, puedes obtener una gratis en https://www.scraperapi.com (1,000 requests/mes gratis)

## Paso 5: Desplegar
1. Haz clic en "Create Web Service"
2. Espera 5-10 minutos mientras Render hace el build
3. Una vez completado, verás un mensaje "Live" con un ✅

## Paso 6: Obtener URL del Servidor
Tu servidor estará disponible en:
```
https://pickgenius-backend.onrender.com
```

## Paso 7: Configurar Vercel
1. Ve a tu proyecto en Vercel: https://vercel.com/pickgenius-projects/pick-genius
2. Ve a "Settings" → "Environment Variables"
3. Agrega una nueva variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://pickgenius-backend.onrender.com`
   - **Environment:** Production, Preview, Development
4. Haz clic en "Save"

## Paso 8: Redeploy en Vercel
1. Ve a "Deployments"
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona "Redeploy"
4. Espera 2-3 minutos

## Paso 9: Verificar
1. Ve a https://pickgeniuspro.com/football-live
2. Deberías ver partidos reales en lugar de mock data
3. Los IDs de partidos deben ser números reales (no 112233, 445566, etc.)

---

## Troubleshooting

### El servidor no inicia
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en Render Dashboard

### Sigue mostrando datos mock
- Verifica que `NEXT_PUBLIC_API_URL` esté configurada en Vercel
- Asegúrate de haber hecho redeploy después de agregar la variable
- Limpia el caché del navegador

### Error 503 en el servidor
- Render puede tardar 30-60 segundos en "despertar" el servidor en el plan gratuito
- Espera un momento y recarga la página

---

## Costos
- **Render Free Tier:** $0/mes (suficiente para empezar)
- **ScraperAPI Free:** 1,000 requests/mes (suficiente para testing)

## Próximos Pasos
Una vez que el servidor esté funcionando:
1. ✅ Verificar datos reales en producción
2. ✅ Probar predicciones de IA
3. ✅ Confirmar mercados secundarios
4. ✅ Monitorear uso de ScraperAPI
