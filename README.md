# PickGenius ⚽🏀

**Plataforma de análisis deportivo con IA y cache inteligente para NBA y Football**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/ingluisvasquez1311-droid/tiren-parleys)
[![Node](https://img.shields.io/badge/node-18.x-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

## 🚀 Características Principales

- ✅ **Sistema de Cache Inteligente** - Reduce llamadas API en 90%+
- ✅ **Rotación Automática de API Keys** - Manejo de múltiples claves
- ✅ **Limpieza Automática** - Elimina partidos jugados y cache expirado
- ✅ **APIs de Football y NBA** - Datos en tiempo real
- ✅ **Predicciones con IA** - Análisis avanzado de partidos
- ✅ **Dashboard de Monitoreo** - Visualiza uso de APIs en tiempo real

## 📦 Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: Next.js + React
- **Database**: Firebase Firestore
- **Cache**: Firestore con TTL inteligente
- **AI**: Google Gemini
- **APIs**: API-Football, NBA API

## 🌐 URLs de Producción

- **API Backend**: https://pickgenius-api.onrender.com
- **Web Frontend**: https://pickgenius-web.onrender.com

## 📚 Documentación

- [**Guía del Sistema de Cache**](CACHE_SYSTEM_GUIDE.md) - Documentación completa del cache
- [**Guía de Despliegue en Render**](DEPLOYMENT_GUIDE_RENDER.md) - Cómo desplegar
- [**Configuración de Variables de Entorno**](RENDER_ENV_SETUP.md) - Setup de env vars

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18.x o superior
- Cuenta de Firebase (plan Blaze)
- API Keys de API-Football

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/ingluisvasquez1311-droid/tiren-parleys.git
cd tiren-parleys

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves

# Iniciar servidor
npm start
```

### Probar el Sistema

```bash
# Health check
curl http://localhost:3000/health

# Obtener partidos próximos
curl "http://localhost:3000/api/football/upcoming?league=39&next=5"

# Ver estadísticas de cache
curl http://localhost:3000/api/cache/stats
```

## 📊 Endpoints de la API

### Football API (con Cache Inteligente)

```
GET  /api/football/upcoming?league=39&next=10
GET  /api/football/predictions/:fixtureId
GET  /api/football/standings/:leagueId?season=2025
POST /api/football/sync
```

### Cache Management

```
GET  /api/cache/stats
POST /api/cache/cleanup
```

### API Usage

```
GET  /api/usage
```

### NBA

```
GET  /api/nba/games
POST /api/sync
```

## 🔧 Scripts Disponibles

```bash
# Sincronizar partidos de fútbol
node src/scripts/syncFootballMatches.js

# Limpiar cache expirado
node src/scripts/cleanupCache.js

# Ver dashboard de uso de API
node src/scripts/apiUsageDashboard.js

# Ejecutar tests
node src/scripts/testFootballApi.js

# Scheduler automático (sync + cleanup)
node src/scripts/autoScheduler.js
```

## 🎯 Sistema de Cache Inteligente

El sistema reduce las llamadas API en más del 90% mediante:

- **TTL Configurable**: 6h fixtures, 12h predictions, 24h standings
- **Auto-limpieza**: Elimina partidos jugados automáticamente
- **Rotación de Keys**: Cambia entre múltiples API keys
- **Persistencia**: Almacena en Firestore

### Eficiencia

```
Sin Cache:  50-100 llamadas/día ❌
Con Cache:  5-10 llamadas/día ✅
Reducción:  90%+ 🎉
```

## 🔐 Variables de Entorno

Ver [RENDER_ENV_SETUP.md](RENDER_ENV_SETUP.md) para la lista completa.

Mínimas requeridas:

```env
FOOTBALL_API_KEY_1=tu-clave-api-football
FIREBASE_CREDENTIALS={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT=tu-proyecto-firebase
NODE_ENV=production
PORT=10000
```

## 📈 Monitoreo

### Dashboard en Tiempo Real

```bash
node src/scripts/apiUsageDashboard.js --watch
```

Muestra:
- Llamadas API restantes
- Eficiencia del cache
- Partidos en cache
- Recomendaciones

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **Luis Vásquez** - [GitHub](https://github.com/ingluisvasquez1311-droid)

## 🙏 Agradecimientos

- API-Football por los datos deportivos
- Firebase por la infraestructura
- Render por el hosting gratuito

---

**PickGenius** - Predicciones deportivas inteligentes 🎯
