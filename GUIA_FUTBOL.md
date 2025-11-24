# ⚽ Guía de Uso - Sistema de Fútbol

## 🎯 Métricas Implementadas

El sistema se enfoca en las siguientes métricas clave para análisis y predicciones:

### 1. **Corners (Tiros de Esquina)**
- Corners local
- Corners visitante
- Total corners por partido

### 2. **Tiros**
- Tiros totales (local y visitante)
- Tiros a puerta (Shots on Target)
- Precisión de tiros

### 3. **Ambos Marcan (BTTS - Both Teams To Score)**
- Indica si ambos equipos anotaron
- Útil para predicciones de "Ambos marcan"

### 4. **Over/Under Goles**
- Over 1.5 goles
- Over 2.5 goles
- Over 3.5 goles

## 📊 Datos Disponibles

### Ligas Principales
- 🇪🇸 **La Liga** (SP1)
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League** (E0)
- 🇮🇹 **Serie A** (I1)
- 🇩🇪 **Bundesliga** (D1)
- 🇫🇷 **Ligue 1** (F1)

### Temporadas
- Temporada actual: 2024-25
- Datos históricos disponibles en CSV

## 🚀 Cargar Datos a Firestore

### Opción 1: Python

```powershell
python src\scripts\football\process_csv.py
```

Este script:
- Procesa todos los CSV de las ligas principales
- Extrae métricas clave
- Carga a Firestore en `football_matches`
- Muestra resumen de estadísticas

### Opción 2: Node.js

```powershell
npm install csv-parser
node load_football_data.js
```

Este script:
- Carga datos desde CSV
- Guarda en Firestore
- Muestra estadísticas por liga

## 📈 API Endpoints

### Cargar Datos

```bash
POST /api/football/load
Content-Type: application/json

{
  "season": "2425"
}
```

### Obtener Estadísticas

```bash
# Todas las ligas
GET /api/football/stats

# Liga específica
GET /api/football/stats/La%20Liga
GET /api/football/stats/Premier%20League
```

Respuesta:
```json
{
  "success": true,
  "stats": {
    "total": 380,
    "bothTeamsScored": {
      "count": 190,
      "percentage": "50.0"
    },
    "over25Goals": {
      "count": 152,
      "percentage": "40.0"
    },
    "avgCorners": "10.5",
    "avgShots": "24.3"
  }
}
```

## 🎨 Dashboard

El dashboard ya está preparado para mostrar datos de fútbol:

```powershell
streamlit run dashboard.py
```

En el sidebar, selecciona **"Fútbol"** para ver:
- Métricas generales por liga
- Gráficos de estadísticas
- Análisis de predicciones (BTTS, Over/Under)
- Distribución de corners y tiros

## 📊 Estructura de Datos en Firestore

### Colección: `football_matches`

```javascript
{
  homeTeam: "Real Madrid",
  awayTeam: "Barcelona",
  date: "2024-11-23",
  league: "La Liga",
  leagueCode: "SP1",
  season: "2024-25",
  
  // Goles
  homeGoals: 2,
  awayGoals: 1,
  totalGoals: 3,
  
  // Corners
  homeCorners: 6,
  awayCorners: 4,
  totalCorners: 10,
  
  // Tiros
  homeShots: 15,
  awayShots: 12,
  totalShots: 27,
  
  // Tiros a puerta
  homeShotsTarget: 8,
  awayShotsTarget: 5,
  totalShotsTarget: 13,
  
  // Métricas de predicción
  bothTeamsScored: true,
  over15Goals: true,
  over25Goals: true,
  over35Goals: false,
  
  // Resultado
  result: "H",  // H = Home, A = Away, D = Draw
  timestamp: "2024-11-23T..."
}
```

## 🔍 Consultas Útiles

### Partidos con ambos marcan

```javascript
db.collection('football_matches')
  .where('bothTeamsScored', '==', true)
  .get()
```

### Partidos con Over 2.5 goles

```javascript
db.collection('football_matches')
  .where('over25Goals', '==', true)
  .get()
```

### Partidos de una liga específica

```javascript
db.collection('football_matches')
  .where('league', '==', 'La Liga')
  .get()
```

## 📝 Próximos Pasos

1. ✅ Cargar datos: `node load_football_data.js`
2. ✅ Verificar en Firestore Console
3. ✅ Ver dashboard: `streamlit run dashboard.py`
4. ✅ Usar API para análisis
5. ✅ Integrar con Gemini AI para predicciones

## 🎯 Casos de Uso

### Análisis de Tendencias
- Equipos con más corners
- Ligas con más goles
- Porcentaje de BTTS por liga

### Predicciones
- Probabilidad de Over 2.5 goles
- Probabilidad de ambos marcan
- Análisis de corners esperados

### Comparación de Ligas
- Promedio de goles por liga
- Promedio de corners por liga
- Eficiencia de tiros

¡Listo para análisis de fútbol! ⚽🎯
