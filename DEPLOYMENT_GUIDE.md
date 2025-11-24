# 🚀 Guía de Deployment en Render

## 📋 Preparación Completada

Todos los archivos necesarios para el deployment están listos:
- ✅ `server.js` - Servidor Express con auto-sync
- ✅ `Procfile` - Configuración de Render
- ✅ `package.json` - Dependencias
- ✅ `.env.example` - Variables de entorno
- ✅ Servicios de sincronización automática

## 🎯 Pasos para Deploy en Render

### 1. Preparar Repositorio Git

```powershell
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: NBA Sync Service con auto-sync y dashboard"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/tiren-parleys.git
git branch -M main
git push -u origin main
```

### 2. Configurar en Render

1. **Ir a** [https://render.com/](https://render.com/)
2. **Sign up / Login** con GitHub
3. **New +** → **Web Service**
4. **Connect repository**: Selecciona `tiren-parleys`

### 3. Configuración del Servicio

**Build & Deploy**:
- **Name**: `tiren-parleys-nba-sync`
- **Region**: `Oregon (US West)` o el más cercano
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan**:
- Selecciona **Free** (para empezar)

### 4. Variables de Entorno

En Render, ve a **Environment** y agrega:

```env
# Firebase
GOOGLE_CLOUD_PROJECT=tu-proyecto-id
FIREBASE_API_KEY=tu-firebase-api-key

# NBA API (balldontlie.io)
NBA_API_KEY=tu-nba-api-key

# Gemini AI
GEMINI_API_KEY=tu-gemini-api-key

# Node
NODE_ENV=production
PORT=3000
```

### 5. Firebase Credentials

**Opción A: Variable de entorno** (Recomendado)

1. Copia el contenido de `firebase-credentials.json`
2. En Render, agrega variable: `FIREBASE_CREDENTIALS`
3. Pega el JSON completo como valor

**Opción B: Secret File**

1. En Render, ve a **Secret Files**
2. Filename: `firebase-credentials.json`
3. Contents: Pega el contenido del archivo

### 6. Deploy

1. Click **Create Web Service**
2. Render automáticamente:
   - Clonará el repo
   - Instalará dependencias
   - Iniciará el servidor
   - Configurará auto-sync

## ✅ Verificación

Una vez deployado, verifica:

```bash
# Health check
curl https://tiren-parleys-nba-sync.onrender.com/health

# Status
curl https://tiren-parleys-nba-sync.onrender.com/api/status

# Manual sync (POST)
curl -X POST https://tiren-parleys-nba-sync.onrender.com/api/sync
```

## 🔄 Sincronización Automática

El servidor automáticamente:
- ✅ Se inicia al deployar
- ✅ Ejecuta `autoSyncService.startDailySync()`
- ✅ Sincroniza últimos 7 días cada 24 horas
- ✅ Guarda datos en Firestore
- ✅ Se mantiene activo 24/7

## 📊 Dashboard

Para el dashboard de Streamlit, necesitas un servicio separado:

### Opción 1: Render (Streamlit)

1. **New +** → **Web Service**
2. **Same repository**
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `streamlit run dashboard.py --server.port=$PORT --server.address=0.0.0.0`

### Opción 2: Streamlit Cloud

1. Ve a [share.streamlit.io](https://share.streamlit.io/)
2. Connect GitHub repo
3. Main file: `dashboard.py`
4. Deploy

## 🔐 Seguridad

**Importante**:
- ✅ Nunca subas `firebase-credentials.json` al repo
- ✅ Usa variables de entorno en Render
- ✅ Agrega `.env` a `.gitignore`
- ✅ Usa Secret Files para credenciales

## 📝 .gitignore

Asegúrate de tener:

```
# Credentials
firebase-credentials.json
.env

# Dependencies
node_modules/
.venv/

# Logs
logs/
*.log

# Data
data/
backups/

# Python
__pycache__/
*.pyc
```

## 🎉 Resultado Final

Después del deployment:

1. **Servidor Node.js**: `https://tiren-parleys-nba-sync.onrender.com`
   - Auto-sync cada 24 horas
   - API endpoints disponibles
   - Logs en Render dashboard

2. **Dashboard Streamlit**: `https://tiren-parleys.streamlit.app`
   - Visualización en tiempo real
   - Accesible desde cualquier lugar
   - Actualización automática

3. **Firestore**: Datos sincronizados en la nube
   - Accesible desde ambos servicios
   - Persistente y escalable

## 🚨 Troubleshooting

### Error: "Module not found"
- Verifica `package.json` tiene todas las dependencias
- Re-deploy desde Render dashboard

### Error: "Firebase credentials"
- Verifica variable `FIREBASE_CREDENTIALS` o Secret File
- Formato debe ser JSON válido

### Sync no funciona
- Verifica `NBA_API_KEY` en variables de entorno
- Revisa logs en Render dashboard
- Prueba endpoint manual: `POST /api/sync`

## 📞 Soporte

- Render Docs: https://render.com/docs
- Streamlit Docs: https://docs.streamlit.io/
- Firebase Docs: https://firebase.google.com/docs

---

**¿Listo para deployar?** Sigue los pasos arriba y tendrás tu servicio NBA corriendo en la nube 24/7! 🚀
