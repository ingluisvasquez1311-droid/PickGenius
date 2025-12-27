# 🏆 PickGenius Backend - Sistema de Robots

Backend local con 2 robots que scrapen datos deportivos y los guardan en Firebase.

## 📦 Estructura del Proyecto

```
backend/
├── robots/
│   ├── sofascoreScraper.js    # 🤖 Robot 1: SofaScore
│   └── betplayReader.js       # 🤖 Robot 2: BetPlay
├── schedulers/
│   └── cronJobs.js            # ⏰ CRON Scheduler
├── data/
│   └── betplay.json           # 📊 Datos de BetPlay (crear manualmente)
├── server.js                  # 🌐 API Express
├── package.json
├── .env                       # ⚙️ Configuración (crear desde .env.example)
└── firebase-service-account.json  # 🔑 Credenciales Firebase
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Guarda el archivo como `firebase-service-account.json` en la carpeta `backend/`

### 3. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus valores
```

**Variables requeridas:**
- `FIREBASE_DATABASE_URL` - URL de tu proyecto Firebase
- `PORT` - Puerto del servidor (default: 3001)
- `NGROK_URL` - URL de Ngrok (opcional)

**Variables opcionales:**
- `SOFASCORE_API_KEY` - API key de RapidAPI (si tienes una)
- `BETPLAY_JSON_URL` - URL remota del JSON de BetPlay

### 4. Crear archivo de datos BetPlay

Crea `backend/data/betplay.json` con el siguiente formato:

```json
{
  "events": [
    {
      "event_id": "12345",
      "sport": "football",
      "odds": {
        "home": 1.85,
        "away": 2.10,
        "draw": 3.50
      },
      "totals": {
        "line": 2.5,
        "over": 1.90,
        "under": 1.95
      },
      "player_props": [
        {
          "player_name": "Messi",
          "market": "goals",
          "line": 0.5,
          "over": 2.20,
          "under": 1.70
        }
      ]
    }
  ]
}
```

## 🧪 Testing

### Probar conexión a Firebase

```bash
npm run test:firebase
```

Deberías ver: `✅ Firebase OK`

### Probar Robot 1 (SofaScore)

```bash
npm run sync:sofascore
```

### Probar Robot 2 (BetPlay)

```bash
npm run sync:betplay
```

### Probar ambos robots

```bash
npm run sync:all
```

## ▶️ Ejecutar el Servidor

### Modo desarrollo (con hot-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

Verás este banner:

```
═══════════════════════════════════════════════════════════════════
║                    🏆 PICKGENIUS BACKEND                         ║
═══════════════════════════════════════════════════════════════════

✅ Server running on port 3001
✅ Firebase connected to project: pickgenius
✅ Ngrok URL: https://tu-dominio.ngrok.io

📡 Available Endpoints:
   POST http://localhost:3001/api/trigger/sofascore
   POST http://localhost:3001/api/trigger/betplay  
   POST http://localhost:3001/api/trigger/all
   GET  http://localhost:3001/api/status
   GET  http://localhost:3001/api/sync/history
   GET  http://localhost:3001/health

🤖 Robots starting...
```

## 📡 API Endpoints

### Control de Robots

#### `POST /api/trigger/sofascore`
Ejecutar Robot 1 manualmente.

```bash
curl -X POST http://localhost:3001/api/trigger/sofascore
```

#### `POST /api/trigger/betplay`
Ejecutar Robot 2 manualmente.

```bash
curl -X POST http://localhost:3001/api/trigger/betplay
```

#### `POST /api/trigger/all`
Ejecutar ambos robots.

```bash
curl -X POST http://localhost:3001/api/trigger/all
```

### Monitoreo

#### `GET /api/status`
Estado del sistema + estadísticas de Firebase.

```bash
curl http://localhost:3001/api/status
```

**Respuesta:**
```json
{
  "status": "ok",
  "firebase": {
    "connected": true,
    "projectId": "pickgenius"
  },
  "data": {
    "events": 150,
    "odds": 120
  },
  "robots": {
    "running": {
      "sofascore": false,
      "betplay": false
    }
  }
}
```

#### `GET /api/sync/history?limit=20`
Historial de sincronizaciones.

```bash
curl http://localhost:3001/api/sync/history?limit=10
```

#### `GET /health`
Health check rápido.

```bash
curl http://localhost:3001/health
```

## ⏰ CRON Schedule

Los robots se ejecutan automáticamente:

- **Robot 1 (SofaScore)**:
  - Eventos programados: Cada 30 minutos
  - Eventos LIVE: Cada 5 minutos

- **Robot 2 (BetPlay)**:
  - Cada 15 minutos

## 🌐 Configurar Ngrok (Opcional)

Para exponer el backend con URL fija:

### 1. Instalar Ngrok

```bash
# Windows
choco install ngrok

# O descarga desde https://ngrok.com/download
```

### 2. Reservar dominio fijo

1. Ve a [Ngrok Dashboard](https://dashboard.ngrok.com/domains)
2. Reserva un dominio (ej: `pickgenius-backend.ngrok.io`)

### 3. Iniciar Ngrok

```bash
ngrok http 3001 --domain=pickgenius-backend.ngrok.io
```

### 4. Actualizar `.env`

```bash
NGROK_URL=https://pickgenius-backend.ngrok.io
```

## 📊 Datos en Firebase

El sistema crea 3 colecciones:

### `events` (Robot 1)
Eventos deportivos de SofaScore.

```javascript
{
  id: "football_12345",
  sport: "football",
  status: "live",
  homeTeam: { name: "Real Madrid", score: 2 },
  awayTeam: { name: "Barcelona", score: 1 },
  startTime: "2025-12-27T19:00:00Z",
  source: "sofascore"
}
```

### `odds` (Robot 2)
Odds de BetPlay.

```javascript
{
  eventId: "12345",
  sport: "football",
  markets: {
    moneyline: { home: 1.85, away: 2.10, draw: 3.50 },
    overUnder: { line: 2.5, over: 1.90, under: 1.95 }
  },
  source: "betplay"
}
```

### `sync_logs`
Historial de sincronizaciones.

```javascript
{
  robot: "sofascore_scraper",
  timestamp: "2025-12-27T10:00:00Z",
  duration: "45.32s",
  totalFound: 150,
  totalSaved: 145
}
```

## 🛠️ Scripts Disponibles

```bash
npm start              # Iniciar servidor
npm run dev            # Desarrollo con hot-reload
npm run sync:sofascore # Ejecutar solo Robot 1
npm run sync:betplay   # Ejecutar solo Robot 2
npm run sync:all       # Ejecutar ambos robots
npm run test:firebase  # Verificar Firebase
npm run ngrok          # Iniciar Ngrok (configurar primero)
```

## 🐛 Troubleshooting

### Error: "Cannot find module './firebase-service-account.json'"

**Solución:** Asegúrate de que el archivo esté en `backend/firebase-service-account.json`

### Error: "ECONNREFUSED" al conectar con SofaScore

**Solución:**
- Verifica tu conexión a internet
- Si usas API key, verifica que sea válida
- SofaScore podría estar bloqueando temporalmente tu IP

### Error: Robot no guarda datos

**Solución:**
1. Ejecuta `npm run test:firebase` para verificar conexión
2. Revisa las reglas de Firestore (deben permitir escritura)
3. Verifica los logs del robot en la consola

### Ngrok se desconecta

**Solución:** Usa un dominio fijo de Ngrok (requiere cuenta paga)

## 🎯 Próximos Pasos

1. ✅ Instalar dependencias
2. ✅ Configurar Firebase
3. ✅ Crear `.env`
4. ✅ Crear `data/betplay.json`
5. ✅ Probar robots manualmente
6. ✅ Iniciar servidor
7. ✅ Verificar datos en Firebase Console
8. 🔜 Configurar Ngrok (opcional)
9. 🔜 Implementar frontend Next.js
10. 🔜 Integrar Groq AI

## 📝 Notas

- Los robots usan tu **IP local** para evitar baneos
- Los datos se guardan en **Firebase** como caché central
- El **frontend lee de Firebase**, no hace scraping directo
- Sistema diseñado para correr 24/7 en tu PC

## 🆘 Soporte

Si tienes problemas, verifica:
1. Logs del servidor en consola
2. Firebase Console → Firestore Database
3. Endpoint `/api/status` para estado del sistema
4. Endpoint `/api/sync/history` para historial

---

**Desarrollado para PickGenius** 🏆
