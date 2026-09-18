# PickGenius 🚀

PickGenius es una plataforma integral de análisis y predicción deportiva que combina recolección de datos en tiempo real, inteligencia artificial y un dashboard interactivo moderno. 

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos grandes ecosistemas:

### 1. Engine de Datos y Oráculo (Backend / Python) 🐍
El motor principal (`python/background_service.py` conocido como *Genius-Sync Engine*) se encarga de todo el procesamiento pesado en segundo plano:
- **Scraping en Vivo**: Captura datos en tiempo real de partidos en curso y programados de diversos deportes (Fútbol, Baloncesto, Tenis, Béisbol, NFL, NHL).
- **Integración de Cuotas**: Descarga y actualiza cuotas reales desde BetPlay (`download_betplay_odds.py`).
- **AI Oracle**: Genera predicciones deportivas avanzadas combinando los resultados y las cuotas, utilizando la API de Groq.
- **Caché y Sincronización**: Almacena datos temporalmente en **Redis** para alta disponibilidad y sincroniza los resultados finales en la nube usando **Firebase**.

### 2. Dashboard Web (Frontend / Next.js) 💻
La interfaz de usuario ubicada en la carpeta `web/` está construida con tecnologías modernas para asegurar la mejor experiencia:
- **Next.js 15**: Framework de React para el renderizado e interfaz.
- **Clerk**: Sistema de autenticación de usuarios y seguridad.
- **Framer Motion & Lucide React**: Animaciones fluidas e iconografía moderna.
- **Recharts**: Visualización de estadísticas, datos y probabilidades en tiempo real.

## ⚙️ Requisitos Previos

Para ejecutar PickGenius localmente, necesitas tener instalado:
1. **Node.js** (para ejecutar el entorno de Next.js y manejar paquetes npm).
2. **Python 3.8+** (para ejecutar el Engine de recolección de datos y predicciones).
3. **Redis** (ejecutándose localmente en el puerto 6379 como caché intermedio).
4. Variables de entorno: Un archivo `.env` configurado en la raíz/entorno web con las credenciales necesarias (Firebase, API de Groq, Clerk, etc.).
5. Archivo de credenciales de Firebase: `firebase-service-account.json` ubicado en la raíz del proyecto.

## 🚀 Cómo Iniciar el Proyecto Localmente

El proyecto incluye un script automatizado para levantar todos los servicios (backend y frontend) de manera simultánea.

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta el archivo batch principal:
   ```cmd
   start_pickgenius_local.bat
   ```
3. El script hará lo siguiente en segundo plano:
   - Iniciará el entorno de Python (`background_service.py`) en una nueva ventana para arrancar el Scraper, el Oráculo de IA y la sincronización continua con Redis/Firebase.
   - Levantará el servidor web de desarrollo de Next.js (`npm run dev`) en otra ventana.
4. Una vez completado, podrás acceder a la plataforma web desde tu navegador ingresando a: **http://localhost:3000**

## 📂 Estructura de Directorios Principal

- `/python`: Scripts del backend, scraper de datos deportivos, oráculo de IA y servicios de sincronización a BD.
- `/web`: Código fuente del frontend (Next.js, páginas, componentes de React, hooks, estilos de Tailwind).
- `/data`: Archivos de almacenamiento local temporal (ej. respaldos locales de cuotas si Redis no está disponible de inmediato).
- `start_pickgenius_local.bat`: Script principal para iniciar el entorno local completo.
- `package.json`: Dependencias de paquetes del ecosistema web.
