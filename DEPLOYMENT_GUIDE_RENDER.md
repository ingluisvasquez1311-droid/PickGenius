# Guía de Despliegue - GitHub y Render

## 📋 Pasos para Desplegar

### 1. Preparar Repositorio GitHub

```bash
# Ver estado actual
git status

# Agregar todos los archivos nuevos
git add .

# Commit de los cambios
git commit -m "feat: Add intelligent cache system for Football API

- Implemented cacheManager with TTL and auto-cleanup
- Added apiRateLimiter with key rotation
- Created footballApiService with cache-first strategy
- Added automated cleanup and sync scripts
- Reduced API calls by 90%+
- Updated server.js with new endpoints"

# Push a GitHub
git push origin main
```

### 2. Configurar Variables de Entorno en Render

Ve a tu dashboard de Render y agrega estas variables de entorno:

#### Variables Requeridas

```env
# Firebase
GOOGLE_CLOUD_PROJECT=tu-proyecto-id
FIREBASE_API_KEY=tu-firebase-key

# API-Football (múltiples claves para rotación)
FOOTBALL_API_KEY_1=89366504adcb0bd1a9aabc84eaf6838e
FOOTBALL_API_KEY_2=tu-segunda-clave
FOOTBALL_API_KEY_3=tu-tercera-clave

# NBA API
NBA_API_KEY=tu-nba-api-key

# Gemini AI
GEMINI_API_KEY=tu-gemini-api-key

# Configuración
NODE_ENV=production
PORT=10000
```

#### Firebase Credentials

En Render, necesitas agregar el contenido de `firebase-credentials.json` como variable de entorno:

1. Copia el contenido de `firebase-credentials.json`
2. En Render, crea una variable llamada `FIREBASE_CREDENTIALS`
3. Pega el contenido JSON completo

### 3. Desplegar en Render

#### Opción A: Desde Dashboard de Render

1. Ve a https://dashboard.render.com/
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio GitHub
4. Configuración:
   - **Name**: `tiren-parleys-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Agrega las variables de entorno (ver arriba)
6. Click "Create Web Service"

#### Opción B: Usando render.yaml (Automático)

El archivo `render.yaml` ya está configurado. Render lo detectará automáticamente.

### 4. Verificar Despliegue

Una vez desplegado, verifica que funcione:

```bash
# Health check
curl https://tu-app.onrender.com/health

# Ver endpoints disponibles
curl https://tu-app.onrender.com/

# Probar Football API
curl "https://tu-app.onrender.com/api/football/upcoming?league=39&next=5"

# Ver estadísticas de cache
curl https://tu-app.onrender.com/api/cache/stats

# Ver uso de API
curl https://tu-app.onrender.com/api/usage
```

### 5. Configurar Cron Jobs en Render

Para ejecutar tareas automáticas, agrega estos cron jobs en Render:

#### Sync Football Matches (cada 6 horas)

```yaml
- type: cron
  name: football-sync
  env: node
  schedule: "0 */6 * * *"  # Cada 6 horas
  buildCommand: npm install
  startCommand: node src/scripts/syncFootballMatches.js
```

#### Cleanup Cache (cada 12 horas)

```yaml
- type: cron
  name: cache-cleanup
  env: node
  schedule: "0 */12 * * *"  # Cada 12 horas
  buildCommand: npm install
  startCommand: node src/scripts/cleanupCache.js
```

## 🔧 Troubleshooting

### Error: Firebase credentials not found

**Solución**: Asegúrate de que `FIREBASE_CREDENTIALS` esté configurado en las variables de entorno de Render.

### Error: API key not found

**Solución**: Verifica que `FOOTBALL_API_KEY_1` esté configurado correctamente.

### Error: Cannot connect to Firestore

**Solución**: 
1. Verifica que las credenciales de Firebase sean correctas
2. Asegúrate de que Firestore esté habilitado en tu proyecto Firebase
3. Verifica las reglas de seguridad de Firestore

### Logs en Render

Para ver los logs:
1. Ve a tu servicio en Render Dashboard
2. Click en "Logs"
3. Verás todos los console.log del servidor

## 📊 Monitoreo Post-Despliegue

### Ver Estado del Sistema

```bash
# Dashboard de API usage
curl https://tu-app.onrender.com/api/usage

# Estadísticas de cache
curl https://tu-app.onrender.com/api/cache/stats

# Estado general
curl https://tu-app.onrender.com/api/status
```

### Ejecutar Tareas Manualmente

```bash
# Sincronizar partidos
curl -X POST https://tu-app.onrender.com/api/football/sync

# Limpiar cache
curl -X POST https://tu-app.onrender.com/api/cache/cleanup

# Sync NBA
curl -X POST https://tu-app.onrender.com/api/sync
```

## 🌐 Endpoints Disponibles

### Football API (con Cache)
- `GET /api/football/upcoming?league=39&next=10` - Partidos próximos
- `GET /api/football/predictions/:fixtureId` - Predicciones
- `GET /api/football/standings/:leagueId?season=2025` - Tabla
- `POST /api/football/sync` - Sincronizar todas las ligas

### Cache Management
- `GET /api/cache/stats` - Estadísticas de cache
- `POST /api/cache/cleanup` - Limpiar cache manualmente

### API Usage
- `GET /api/usage` - Ver uso de APIs y claves disponibles

### NBA
- `GET /api/nba/games` - Partidos de hoy
- `POST /api/sync` - Sincronizar NBA

## 🚀 Próximos Pasos

1. ✅ Desplegar en Render
2. ✅ Configurar variables de entorno
3. ✅ Verificar que funcione
4. ⏰ Configurar cron jobs
5. 📊 Monitorear uso de API
6. 🔗 Conectar con frontend (Next.js)

## 📝 Notas Importantes

- **Free Tier de Render**: El servicio se dormirá después de 15 minutos de inactividad
- **Cold Start**: La primera request después de dormir tardará ~30 segundos
- **Firestore**: Asegúrate de tener el plan Blaze (pay-as-you-go) para usar desde Render
- **API Limits**: Monitorea el uso diario para no exceder los 100 calls/día por clave

## 🔗 Enlaces Útiles

- **Render Dashboard**: https://dashboard.render.com/
- **Firebase Console**: https://console.firebase.google.com/
- **API-Football Dashboard**: https://dashboard.api-football.com/
- **Documentación del Sistema**: Ver `CACHE_SYSTEM_GUIDE.md`
