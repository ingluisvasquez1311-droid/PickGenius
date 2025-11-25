# Sistema de Cache Inteligente - Guía de Uso

## 📋 Descripción

Sistema de cache inteligente que minimiza las llamadas a APIs externas (Football y NBA) almacenando datos en Firestore con TTL (time-to-live) y limpieza automática de partidos jugados.

## 🎯 Características Principales

- ✅ **Cache inteligente** con expiración automática (6-12 horas)
- ✅ **Rotación de API keys** cuando se alcanza el límite diario
- ✅ **Limpieza automática** de partidos jugados
- ✅ **Monitoreo en tiempo real** del uso de APIs
- ✅ **Reducción de 90%+** en llamadas API

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia `.env.example` a `.env` y agrega tus claves API:

```bash
# API-Football Keys (100 calls/day each)
FOOTBALL_API_KEY_1=89366504adcb0bd1a9aabc84eaf6838e
FOOTBALL_API_KEY_2=tu-segunda-clave
FOOTBALL_API_KEY_3=tu-tercera-clave
```

### 2. Probar la Integración

```bash
# Test completo del sistema
node src/scripts/testFootballApi.js
```

### 3. Sincronizar Partidos Próximos

```bash
# Sincronizar todas las ligas principales
node src/scripts/syncFootballMatches.js
```

### 4. Ver Dashboard de Uso

```bash
# Dashboard estático
node src/scripts/apiUsageDashboard.js

# Dashboard con auto-refresh (cada 30s)
node src/scripts/apiUsageDashboard.js --watch
```

### 5. Limpiar Cache Expirado

```bash
# Ejecutar limpieza manual
node src/scripts/cleanupCache.js
```

## 🤖 Automatización

### Opción 1: Scheduler Integrado (Recomendado)

```bash
# Inicia scheduler automático
# - Sync cada 6 horas
# - Cleanup cada 12 horas
node src/scripts/autoScheduler.js
```

### Opción 2: Cron Jobs (Windows Task Scheduler)

Crear tareas programadas en Windows:

**Sync diario (cada 6 horas):**
```powershell
# Abrir Task Scheduler
taskschd.msc

# Crear nueva tarea:
# - Trigger: Diario, repetir cada 6 horas
# - Action: node "c:\Users\Daniel\PickGenius\src\scripts\syncFootballMatches.js"
```

**Cleanup diario (cada 12 horas):**
```powershell
# - Trigger: Diario, repetir cada 12 horas
# - Action: node "c:\Users\Daniel\PickGenius\src\scripts\cleanupCache.js"
```

## 📊 Uso de la API

### Obtener Partidos Próximos

```javascript
const footballApiService = require('./src/services/football/footballApiService');

// Obtener próximos 10 partidos de Premier League
const fixtures = await footballApiService.getUpcomingFixtures(39, { next: 10 });

console.log(fixtures.fixtures);
// Primera llamada: API
// Siguientes llamadas (6 horas): Cache
```

### Obtener Predicciones

```javascript
// Obtener predicciones para un partido específico
const predictions = await footballApiService.getFixturePredictions(fixtureId);

console.log(predictions.predictions);
// Cache: 12 horas
```

### Obtener Tabla de Posiciones

```javascript
// Tabla de posiciones de La Liga
const standings = await footballApiService.getLeagueStandings(140, 2025);

console.log(standings.standings);
// Cache: 24 horas
```

## 🔧 Configuración Avanzada

### Modificar TTL del Cache

En `src/services/cacheManager.js`:

```javascript
this.defaultTTL = {
    fixtures: 6 * 60 * 60,      // 6 horas (ajustable)
    predictions: 12 * 60 * 60,  // 12 horas (ajustable)
    standings: 24 * 60 * 60     // 24 horas (ajustable)
};
```

### Agregar Más API Keys

En `.env`:

```bash
FOOTBALL_API_KEY_1=clave1
FOOTBALL_API_KEY_2=clave2
FOOTBALL_API_KEY_3=clave3
# ... hasta FOOTBALL_API_KEY_10
```

El sistema rotará automáticamente entre claves disponibles.

## 📈 Monitoreo

### Dashboard en Tiempo Real

```bash
node src/scripts/apiUsageDashboard.js --watch
```

Muestra:
- ✅ Llamadas API restantes por clave
- ✅ Eficiencia del cache
- ✅ Partidos en cache (scheduled/live/finished)
- ✅ Recomendaciones automáticas

### Estadísticas de Cache

```javascript
const cacheManager = require('./src/services/cacheManager');

const stats = await cacheManager.getStats('football');
console.log(stats);
// {
//   total: 150,
//   valid: 145,
//   expired: 5,
//   byStatus: { scheduled: 120, live: 5, finished: 20 }
// }
```

## 🗑️ Limpieza Automática

El sistema elimina automáticamente:

1. **Cache expirado** (después del TTL)
2. **Partidos jugados** (2 horas después de finalizar)
3. **Datos obsoletos**

### Limpieza Manual

```javascript
const cacheManager = require('./src/services/cacheManager');

// Limpiar solo Football
await cacheManager.cleanupExpired('football');

// Limpiar solo NBA
await cacheManager.cleanupExpired('nba');

// Limpiar todo
await cacheManager.cleanupExpired();
```

## 🎯 Estrategia de Uso Óptimo

### Minimizar Llamadas API

1. **Sync programado**: Ejecutar sync cada 6 horas (4 veces al día)
2. **Cache-first**: Siempre consulta cache antes de API
3. **Cleanup regular**: Limpiar cache cada 12 horas
4. **Múltiples keys**: Usar 2-3 claves API para redundancia

### Estimación de Uso

Con esta estrategia:
- **Sync diario**: ~5-10 llamadas API
- **Consultas de usuarios**: 0 llamadas (todo desde cache)
- **Total diario**: ~10-15 llamadas de 100 disponibles
- **Eficiencia**: ~85-90% de reducción

## 🔍 Troubleshooting

### Error: "All API keys have reached daily limit"

**Solución**: 
1. Agregar más claves API en `.env`
2. Esperar al reset diario (00:00 UTC)
3. Verificar dashboard: `node src/scripts/apiUsageDashboard.js`

### Cache no se está utilizando

**Solución**:
1. Verificar que Firestore esté configurado
2. Ejecutar test: `node src/scripts/testFootballApi.js`
3. Revisar logs para errores

### Partidos jugados no se eliminan

**Solución**:
1. Ejecutar cleanup manual: `node src/scripts/cleanupCache.js`
2. Verificar que `autoScheduler.js` esté corriendo
3. Revisar estado de partidos en Firestore

## 📝 Logs y Debugging

Todos los scripts generan logs detallados:

```bash
# Ver logs en tiempo real
node src/scripts/autoScheduler.js

# Logs incluyen:
# ✅ Cache hits/misses
# ✅ API calls realizadas
# ✅ Documentos eliminados
# ✅ Errores y warnings
```

## 🔗 IDs de Ligas Principales

```javascript
premierLeague: 39
laLiga: 140
serieA: 135
bundesliga: 78
ligue1: 61
```

## 📞 Soporte

Para más información, revisa:
- `src/services/cacheManager.js` - Lógica de cache
- `src/services/apiRateLimiter.js` - Control de cuotas
- `src/services/football/footballApiService.js` - Integración API-Football
