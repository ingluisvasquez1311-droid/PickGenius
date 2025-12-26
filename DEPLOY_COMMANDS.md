# 🚀 Comandos para Deploy

## 1. Preparar Git

```powershell
# Verificar estado
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: NBA Sync Service completo con auto-sync, dashboard y deployment"

# Si no tienes remote configurado:
git remote add origin https://github.com/TU-USUARIO/tiren-parleys.git

# Push
git push -u origin main
```

## 3. Verificar Deployment

1. Ve a tu plataforma de hosting (e.g., Vercel)
2. Verifica que el servicio esté corriendo en `/health` o `/api/status`

## 4. Deploy Dashboard (Opcional)

### Opción A: Streamlit Cloud

1. Ve a https://share.streamlit.io/
2. Connect GitHub
3. Repository: `tiren-parleys`
4. Main file: `dashboard.py`
5. Deploy

### Opción B: Render (Streamlit)

1. New + → Web Service
2. Same repository
3. Build: `pip install -r requirements.txt`
4. Start: `streamlit run dashboard.py --server.port=$PORT --server.address=0.0.0.0`

## 5. Resultado

- **API**: https://tiren-parleys-nba.onrender.com
- **Dashboard**: https://tiren-parleys.streamlit.app
- **Auto-sync**: Cada 24 horas automáticamente
- **Datos**: En Firestore (cloud)

¡Listo! 🎉
