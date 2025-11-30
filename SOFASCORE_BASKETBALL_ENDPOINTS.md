# SofaScore - Endpoints Detallados

Basándome en las imágenes compartidas, aquí están los endpoints necesarios para obtener estadísticas detalladas como rebotes, puntos, asistencias, etc.

## Endpoints de Baloncesto/NBA

### 1. Eventos en Vivo
```
GET https://www.sofascore.com/api/v1/sport/basketball/events/live
```

### 2. Estadísticas del Juego
```
GET https://www.sofascore.com/api/v1/event/{eventId}/statistics
```
Retorna:
- Puntos por periodo
- Rebotes (total, defensivos, ofensivos)
- Asistencias
- Pérdidas de balón
- Tiros (libres, 2pts, 3pts, campo)
- Bloques
- Faltas

### 3. Estadísticas del Jugador
```
GET https://www.sofascore.com/api/v1/player/{playerId}/statistics
```
Retorna estadísticas detalladas del jugador por temporada

### 4. Información del Jugador
```
GET https://www.sofascore.com/api/v1/player/{playerId}
```

### 5. Equipos - Standings
```
GET https://www.sofascore.com/api/v1/unique-tournament/{tournamentId}/season/{seasonId}/standings/total
```

## Ejemplo de Datos que Podemos Obtener

Basado en las imágenes, podemos mostrar:

### Puntos (por partido)
- Total
- Tiros libres (con %)
- Tiros de 2 puntos (con %)
- Tiros de 3 puntos (con %)
- Tiros desde el campo (con %)

### Rebotes (por partido)
- Total
- Defensivos
- Ofensivos

### Otros (por partido)
- Asistencias
- Pérdidas de balón
- Robos
- Ratio asistencias/pérdidas de balón
- Bloques
- Faltas personales
- +/-

## Script de Prueba

Ejecuta: `node scripts/explore_sofascore_basketball.js`

Esto te mostrará exactamente qué datos podemos extraer.
