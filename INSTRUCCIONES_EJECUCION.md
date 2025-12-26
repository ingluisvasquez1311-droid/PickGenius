# PickGenius - Instrucciones de Ejecución y Solución Vercel-Ngrok

Este documento resume los cambios realizados para establecer una conexión robusta entre el frontend en Vercel y el backend local vía Ngrok.

### 1. Iniciar el Backend
Desde la raíz del proyecto:
```bash
node server.js
```
*El backend ahora corre en el puerto **3001**.*

### 2. Iniciar Ngrok
En una terminal aparte:
```bash
ngrok http 3001
```
Copia la URL generada (ej: `https://abcd-123.ngrok-free.app`).

### 3. Configurar Vercel (CRÍTICO)
1. Ve al dashboard de Vercel -> Settings -> Environment Variables.
2. Actualiza `NEXT_PUBLIC_API_URL` con la URL de Ngrok que copiaste.
3. **Redeploy**: Ve a la pestaña "Deployments" y haz un "Redeploy" del último commit.

### ⚠️ Notas Importantes de Configuración

### ⚽ Deportes Soportados (Multi-Sport)
La aplicación ahora soporta plenamente:
- **Fútbol (Soccer)**: Ligas principales, Champions, etc.
- **Baloncesto (NBA/Euroliga)**: Con predicciones detalladas de props.
- **Tenis (ATP/WTA)**: Resultados en vivo y cuadros.
- **MLB (Béisbol)**: Resultados y estadísticas de temporada.
- **NHL (Hockey)**: Cobertura completa de la liga de hockey.
- **NFL (Fútbol Americano)**: Predicciones y stats especializadas.

### 🔌 Conectividad Unificada
Todos los deportes utilizan el mismo sistema de fetching directo a Sofascore, eliminando dependencias de terceros y garantizando latencia mínima.

1. **Firebase y Groq**:
   - Para que las predicciones e inicio de sesión funcionen, debes completar los datos en `web/.env.local`. Copia el contenido de ejemplo de otros proyectos o pídelo si no lo tienes a mano.

2. **Vercel**:
   - Cada vez que reinicies Ngrok, **DEBES** actualizar la variable `NEXT_PUBLIC_API_URL` en el dashboard de Vercel y re-desplegar (Redeploy).

---
### Resumen de Cambios
- **`web/lib/api.ts`**: Nuevo ayudante centralizado para todas las llamadas API.
- **`web/app/page.tsx`**: Refactorización para cumplir con la política de datos Sofascore.
