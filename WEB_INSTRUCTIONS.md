# 🌐 Guía de Inicio - Interfaz Web Tirens Parleys

¡La interfaz web moderna ya está lista! Sigue estos pasos para ejecutar todo el sistema (Backend + Frontend).

## 1. Iniciar el Backend (Servidor de Datos)

Este servidor provee los datos de la API y conecta con Firebase.

```powershell
# En una terminal nueva:
cd "C:\Users\Daniel\Tiren Parleys"
node server.js
```
*El servidor iniciará en el puerto **3001**.*

## 2. Iniciar el Frontend (Interfaz Web)

Esta es la página web que verán los usuarios.

```powershell
# En OTRA terminal nueva:
cd "C:\Users\Daniel\Tiren Parleys\web"
npm run dev
```
*La web iniciará en **http://localhost:3000**.*

## 🚀 Características Implementadas

### 🎨 Diseño Premium
- **Dark Mode**: Fondo oscuro con acentos neón (Verde/Morado).
- **Glassmorphism**: Tarjetas con efecto de vidrio translúcido.
- **Responsivo**: Se adapta a móviles y escritorio.

### 🏀 Sección NBA (`/nba`)
- Predicciones del día con "Consejos del Mago".
- Tarjetas de partidos con resultados en vivo (simulados por ahora).

### ⚽ Sección Fútbol (`/football`)
- Cobertura de ligas principales.
- Recomendaciones de apuestas (BTTS, Over/Under).

### 🧙‍♂️ Consejos del Mago
- Explicaciones personalizadas para cada predicción.
- Indicadores de confianza visuales.

## 🛠️ Estructura del Proyecto Web

```
web/
├── app/
│   ├── page.tsx        # Landing Page
│   ├── nba/            # Página NBA
│   ├── football/       # Página Fútbol
│   ├── layout.tsx      # Layout Principal (Navbar)
│   └── globals.css     # Estilos Globales (Variables CSS)
├── components/
│   ├── layout/         # Navbar
│   └── sports/         # MatchCard, PredictionCard
└── lib/
    └── api.ts          # Conexión con Backend
```

## 📝 Notas Importantes
- Si ves errores de conexión en la web, asegúrate de que `server.js` esté corriendo.
- Los datos de partidos son simulados (Mock) si el backend no responde o no tiene datos, para asegurar que la interfaz siempre se vea bien.
