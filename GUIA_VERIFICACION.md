# 🔍 Guía de Verificación de Datos NBA

## Script de Verificación: verify_data.py

Este script verifica la integridad de los datos sincronizados en Firestore.

### Funcionalidades

1. **Conteo de documentos** - Cuenta total de registros por colección
2. **Verificación de integridad** - Valida que todos los campos requeridos existan
3. **Análisis por equipo** - Cuenta documentos por cada equipo NBA
4. **Análisis por temporada** - Agrupa datos por temporada
5. **Documento de ejemplo** - Muestra estructura de un documento

### Uso

```powershell
python src\scripts\verify_data.py
```

### Salida Esperada

```
🏀 VERIFICACIÓN DE DATOS NBA EN FIRESTORE
======================================================================

📦 COLECCIÓN: nba_regular_season_box_scores_2010_2024_part_3
======================================================================

📊 Contando documentos...
   Total: 15,234 documentos

🔍 Verificando integridad de datos...
   Documentos verificados: 100
   ✅ Documentos válidos: 100 (100.0%)
   ✅ Todos los documentos tienen campos requeridos

📈 Contando documentos por equipo...
   Equipo     Documentos
   ---------- ------------
   ATL             1,234
   BOS             1,456
   ...

📅 Contando documentos por temporada...
   Temporada    Documentos
   ------------ ------------
   2023-24         15,234
```

### Campos Verificados

- `gameId` - ID del juego
- `teamTricode` - Código del equipo (ej: LAL, BOS)
- `personName` - Nombre del jugador
- `points` - Puntos anotados
- `reboundsTotal` - Rebotes totales
- `assists` - Asistencias
- `season_year` - Temporada (ej: 2024-25)
- `game_date` - Fecha del juego

### Identificación de Problemas

El script automáticamente identifica:

- ✅ Equipos con datos completos
- ⚠️ Equipos con datos por debajo del promedio
- ❌ Documentos con campos faltantes
- 📊 Distribución de datos por temporada

### Próximos Pasos

Si encuentras problemas:

1. **Datos faltantes por equipo**: Ejecuta `find_and_fill_gaps.py`
2. **Campos faltantes**: Revisa los scripts de sincronización
3. **Colección vacía**: Ejecuta `fetch_missing_data.py`

## Sincronización Automática

### autoSyncService.js

Servicio Node.js para sincronización automática diaria.

#### Configuración

1. **API Key**: Configura `NBA_API_KEY` en `.env`
   ```env
   NBA_API_KEY=tu-api-key-de-balldontlie
   ```

2. **Temporada**: Ya configurado para 2024-25

3. **Colección**: Guarda en `nba_regular_season_box_scores_2024_25`

#### Uso Manual

```javascript
const autoSync = require('./src/services/autoSyncService');

// Sincronizar últimos 7 días
await autoSync.syncCurrentSeason();
```

#### Uso Programado

```javascript
// Iniciar sincronización diaria automática
autoSync.startDailySync();
```

Esto ejecutará la sincronización:
- Inmediatamente al iniciar
- Cada 24 horas automáticamente

#### Desde Node.js

```powershell
npm run sync:data
```

### Qué Sincroniza

- 📅 **Período**: Últimos 7 días
- 🏀 **Juegos**: Solo juegos finalizados
- 📊 **Datos**: Estadísticas de jugadores (box scores)
- 💾 **Destino**: Firestore colección `nba_regular_season_box_scores_2024_25`

### Monitoreo

El servicio muestra logs detallados:

```
🔄 Auto-syncing 2024-25 season data...
📊 Fetched 15 games from API
  📦 Saved batch: 15 games
    📊 Saved stats for game 0022400123 (20 players)
✅ Auto-sync completed: 15 games processed
```

## Flujo Completo de Verificación

### 1. Después de Sincronización Inicial

```powershell
# Verificar datos
python src\scripts\verify_data.py
```

### 2. Si Encuentras Huecos

```powershell
# Rellenar huecos
python src\scripts\find_and_fill_gaps.py
```

### 3. Verificar Nuevamente

```powershell
# Re-verificar
python src\scripts\verify_data.py
```

### 4. Configurar Sincronización Automática

```powershell
# Iniciar servidor con auto-sync
npm start
```

O configurar como servicio/cron job para ejecución continua.

## Troubleshooting

### Error: "Collection not found"
- La colección se crea automáticamente al guardar el primer documento
- Ejecuta primero `fetch_missing_data.py`

### Error: "Permission denied"
- Verifica credenciales Firebase
- Revisa reglas de Firestore

### Datos inconsistentes
- Ejecuta `find_and_fill_gaps.py` para detectar y corregir
- Verifica logs de sincronización para errores

### API Rate Limits
- Los scripts ya incluyen delays
- Si persiste, aumenta delays en los scripts
- Considera usar API key premium
