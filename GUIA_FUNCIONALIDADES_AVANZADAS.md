# 🎯 Guía Completa de Nuevas Funcionalidades

## 📊 Dashboard de Monitoreo (Streamlit)

### Instalación

```powershell
pip install streamlit plotly pandas
```

### Uso

```powershell
streamlit run dashboard.py
```

El dashboard se abrirá en `http://localhost:8501`

### Características

- ✅ **Métricas en tiempo real**: Total documentos, equipos, promedios
- ✅ **Gráficos interactivos**: Distribución por equipo y temporada
- ✅ **Análisis de huecos**: Identifica equipos con datos incompletos
- ✅ **Visualización de logs**: Lee y muestra logs recientes
- ✅ **Auto-refresh**: Actualización automática configurable

### Capturas

El dashboard muestra:
- Métricas generales de cada colección
- Gráficos de barras por equipo
- Gráficos de pie por temporada
- Tabla de equipos con datos incompletos
- Visor de logs con filtros

---

## 🔔 Sistema de Notificaciones

### Configuración

Agrega a tu `.env`:

```env
# Email (SendGrid)
SENDGRID_API_KEY=tu-api-key
NOTIFICATION_FROM_EMAIL=sync@tirenparleys.com
NOTIFICATION_TO_EMAIL=admin@tirenparleys.com

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

### Uso

```python
from src.services.notificationService import NotificationService

notifier = NotificationService()

# Notificar error
notifier.send_error_notification(
    "Error de conexión a NBA API",
    context={'equipo': 'LAL', 'temporada': '2024-25'}
)

# Notificar éxito
notifier.send_success_notification({
    'games_processed': 150,
    'records_saved': 3000,
    'errors': 2
})
```

### Canales Soportados

- **Email**: Vía SendGrid
- **Slack**: Vía Webhook
- **Discord**: Vía Webhook

---

## 🧪 Tests Automatizados

### Instalación

```powershell
pip install pytest pytest-mock
```

### Ejecutar Tests

```powershell
# Todos los tests
pytest tests/test_sync_scripts.py -v

# Solo tests específicos
pytest tests/test_sync_scripts.py::TestFetchMissingData -v

# Con coverage
pytest tests/test_sync_scripts.py --cov=src --cov-report=html
```

### Tests Incluidos

- ✅ Test de obtención de team ID
- ✅ Test de sincronización de datos
- ✅ Test de verificación de integridad
- ✅ Test de monitoreo
- ✅ Test de notificaciones
- ✅ Tests de integración (opcionales)

---

## ⏰ Cron Job / Sincronización Automática

### Configurar Windows Task Scheduler

1. **Abrir Task Scheduler**:
   ```powershell
   taskschd.msc
   ```

2. **Crear Nueva Tarea**:
   - Nombre: "NBA Sync Daily"
   - Descripción: "Sincronización diaria de datos NBA"

3. **Trigger**:
   - Diario a las 3:00 AM
   - O después de iniciar el sistema

4. **Action**:
   - Programa: `powershell.exe`
   - Argumentos: `-ExecutionPolicy Bypass -File "c:\Users\Daniel\PickGenius\cron_sync.ps1"`

5. **Conditions**:
   - ☑️ Iniciar solo si el equipo está conectado a AC
   - ☑️ Despertar el equipo para ejecutar

### Ejecutar Manualmente

```powershell
.\cron_sync.ps1
```

### Logs

Los logs se guardan en `logs/cron/cron_YYYYMMDD_HHMMSS.log`

---

## 💾 Sistema de Backups

### Uso Básico

```powershell
# Hacer backup de todas las colecciones
python src\services\backupService.py backup

# Restaurar desde backup
python src\services\backupService.py restore backups/coleccion_20241123_120000.json.gz nombre_coleccion

# Limpiar backups antiguos (>30 días)
python src\services\backupService.py cleanup 30
```

### Características

- ✅ **Compresión automática**: Archivos .json.gz
- ✅ **Backup incremental**: Solo datos nuevos
- ✅ **Restauración completa**: Restaura colecciones enteras
- ✅ **Limpieza automática**: Elimina backups antiguos
- ✅ **Logging detallado**: Progreso en tiempo real

### Programar Backups Automáticos

Agrega al cron job o crea tarea separada:

```powershell
# Backup semanal
python src\services\backupService.py backup
python src\services\backupService.py cleanup 30
```

---

## 🔄 Flujo de Trabajo Completo

### 1. Sincronización Diaria Automática

```
03:00 AM - Cron job ejecuta
  ├─ Sincroniza datos nuevos
  ├─ Verifica integridad
  ├─ Limpia logs antiguos
  └─ Envía notificación
```

### 2. Monitoreo en Dashboard

```
Durante el día - Dashboard activo
  ├─ Visualiza métricas en tiempo real
  ├─ Identifica problemas
  └─ Revisa logs
```

### 3. Backup Semanal

```
Domingo 02:00 AM - Backup automático
  ├─ Exporta todas las colecciones
  ├─ Comprime archivos
  └─ Limpia backups antiguos
```

### 4. Notificaciones

```
En caso de error - Notificación inmediata
  ├─ Email al administrador
  ├─ Mensaje en Slack
  └─ Alerta en Discord
```

---

## 📋 Checklist de Configuración

### Inicial
- [ ] Instalar dependencias adicionales: `pip install -r requirements.txt`
- [ ] Configurar variables de entorno en `.env`
- [ ] Probar dashboard: `streamlit run dashboard.py`
- [ ] Probar notificaciones: `python src/services/notificationService.py`

### Cron Job
- [ ] Configurar Task Scheduler
- [ ] Probar ejecución manual: `.\cron_sync.ps1`
- [ ] Verificar logs en `logs/cron/`

### Backups
- [ ] Crear directorio `backups/`
- [ ] Hacer primer backup: `python src/services/backupService.py backup`
- [ ] Configurar backup semanal en Task Scheduler

### Tests
- [ ] Instalar pytest: `pip install pytest pytest-mock`
- [ ] Ejecutar tests: `pytest tests/ -v`
- [ ] Configurar CI/CD (opcional)

---

## 🎯 Mejores Prácticas

1. **Dashboard**: Déjalo corriendo durante sincronizaciones largas
2. **Notificaciones**: Configura al menos un canal (Slack recomendado)
3. **Backups**: Ejecuta backup antes de cambios importantes
4. **Tests**: Ejecuta antes de deployments
5. **Cron Job**: Revisa logs semanalmente

---

## 🆘 Troubleshooting

### Dashboard no inicia
```powershell
pip install --upgrade streamlit plotly pandas
streamlit run dashboard.py
```

### Notificaciones no se envían
- Verifica variables de entorno en `.env`
- Prueba webhooks manualmente
- Revisa logs de errores

### Cron job falla
- Revisa logs en `logs/cron/`
- Verifica permisos de ejecución
- Ejecuta manualmente para debugging

### Backup muy lento
- Usa compresión (por defecto)
- Considera backups incrementales
- Ejecuta en horarios de baja actividad

---

## 📊 Métricas de Éxito

Después de configurar todo:

- ✅ Dashboard accesible en http://localhost:8501
- ✅ Notificaciones funcionando (test enviado)
- ✅ Cron job ejecutándose diariamente
- ✅ Backups semanales creados
- ✅ Tests pasando (pytest)

¡Sistema completo de sincronización NBA listo! 🏀
