# 🛠️ Guía de Herramientas Avanzadas

## Scripts Mejorados

### 1. fetch_missing_data_improved.py

Versión mejorada del script de sincronización con:

#### Características

- ✅ **Retry Logic**: Reintenta automáticamente en caso de errores (3 intentos por defecto)
- ✅ **Logging Detallado**: Guarda logs en archivo con timestamps
- ✅ **Manejo Robusto de Errores**: Continúa sincronización aunque fallen algunos juegos
- ✅ **Estadísticas Completas**: Resumen detallado al final
- ✅ **Guardado Individual**: Si falla batch, intenta guardar uno por uno

#### Uso

```powershell
python src\scripts\fetch_missing_data_improved.py
```

#### Logs

Los logs se guardan en `logs/sync_YYYYMMDD_HHMMSS.log`

Ejemplo de log:
```
2024-11-23 20:30:00 - INFO - 🏀 Procesando LAL para temporada 2024-25
2024-11-23 20:30:05 - INFO - Encontrados 25 juegos
2024-11-23 20:30:10 - WARNING - Intento 1 falló: Timeout. Reintentando en 5s...
2024-11-23 20:30:15 - INFO - ✅ Guardados 500 registros para LAL (2024-25)
```

#### Configuración

Puedes ajustar en el código:
```python
MAX_RETRIES = 3  # Número de reintentos
RETRY_DELAY = 5  # Segundos entre reintentos
```

---

### 2. monitor_sync.py

Script para monitorear sincronización en tiempo real.

#### Modo 1: Monitor en Tiempo Real

```powershell
# Monitorear cada 30 segundos durante 60 minutos
python src\scripts\monitor_sync.py monitor nba_regular_season_box_scores_2024_25 30 60
```

**Salida**:
```
📊 MONITOR DE SINCRONIZACIÓN - nba_regular_season_box_scores_2024_25
======================================================================
Intervalo: 30s | Duración: 60min
Inicio: 2024-11-23 20:30:00
======================================================================

[20:30:00] Iteración #1
  Total documentos: 1,234
  Nuevos desde última verificación: 1,234
  Tasa promedio: 41.13 docs/seg
  ✅ Sincronización activa

[20:30:30] Iteración #2
  Total documentos: 2,456
  Nuevos desde última verificación: 1,222
  Tasa promedio: 40.93 docs/seg
  ✅ Sincronización activa
```

#### Modo 2: Resumen

```powershell
python src\scripts\monitor_sync.py summary
```

**Salida**:
```
📊 RESUMEN DE SINCRONIZACIÓN
======================================================================
Fecha: 2024-11-23 20:35:00

📦 nba_regular_season_box_scores_2010_2024_part_3
   Total documentos: 5,234
   Equipos con datos: 2
   Promedio por equipo: 2,617

📦 nba_regular_season_box_scores_2024_25
   Total documentos: 15,678
   Equipos con datos: 30
   Promedio por equipo: 523
```

---

## Flujo de Trabajo Recomendado

### Durante Sincronización

1. **Iniciar sincronización mejorada**:
   ```powershell
   python src\scripts\fetch_missing_data_improved.py
   ```

2. **En otra terminal, monitorear progreso**:
   ```powershell
   python src\scripts\monitor_sync.py monitor nba_regular_season_box_scores_2024_25 30 120
   ```

3. **Revisar logs** (si hay errores):
   ```powershell
   Get-Content logs\sync_*.log -Tail 50
   ```

### Después de Sincronización

1. **Obtener resumen**:
   ```powershell
   python src\scripts\monitor_sync.py summary
   ```

2. **Verificar integridad**:
   ```powershell
   python src\scripts\verify_data.py
   ```

3. **Rellenar huecos** (si es necesario):
   ```powershell
   python src\scripts\find_and_fill_gaps.py
   ```

---

## Comparación de Scripts

### fetch_missing_data.py (Original)
- ✅ Simple y directo
- ❌ Sin retry logic
- ❌ Logging básico
- ❌ Se detiene en errores

### fetch_missing_data_improved.py (Mejorado)
- ✅ Retry automático
- ✅ Logging detallado en archivo
- ✅ Continúa aunque fallen algunos juegos
- ✅ Estadísticas completas
- ✅ Guardado individual como fallback

**Recomendación**: Usa la versión mejorada para sincronizaciones importantes.

---

## Troubleshooting con Logs

### Ver últimas líneas del log
```powershell
Get-Content logs\sync_*.log -Tail 100
```

### Buscar errores
```powershell
Select-String -Path logs\sync_*.log -Pattern "ERROR"
```

### Contar errores
```powershell
(Select-String -Path logs\sync_*.log -Pattern "ERROR").Count
```

### Ver solo warnings y errors
```powershell
Select-String -Path logs\sync_*.log -Pattern "WARNING|ERROR"
```

---

## Configuración de Notificaciones (Futuro)

Para implementar notificaciones automáticas, puedes:

### Opción 1: Email con SendGrid

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_error_notification(error_msg):
    message = Mail(
        from_email='sync@tirenparleys.com',
        to_emails='admin@tirenparleys.com',
        subject='Error en Sincronización NBA',
        html_content=f'<strong>Error:</strong> {error_msg}'
    )
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    sg.send(message)
```

### Opción 2: Slack Webhook

```python
import requests

def send_slack_notification(message):
    webhook_url = os.environ.get('SLACK_WEBHOOK_URL')
    payload = {'text': message}
    requests.post(webhook_url, json=payload)
```

### Opción 3: Discord Webhook

```python
def send_discord_notification(message):
    webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
    payload = {'content': message}
    requests.post(webhook_url, json=payload)
```

---

## Dashboard de Monitoreo (Futuro)

Puedes crear un dashboard simple con:

### Opción 1: Streamlit

```python
import streamlit as st
import pandas as pd

st.title("🏀 Dashboard de Sincronización NBA")

# Mostrar estadísticas en tiempo real
col1, col2, col3 = st.columns(3)
col1.metric("Total Documentos", "15,678", "+1,234")
col2.metric("Equipos", "30", "0")
col3.metric("Tasa", "45 docs/seg", "+5")

# Gráfico de progreso
# ...
```

### Opción 2: Flask + Chart.js

```javascript
// Frontend simple con Chart.js
fetch('/api/sync-stats')
    .then(res => res.json())
    .then(data => {
        // Renderizar gráficos
    });
```

---

## Mejores Prácticas

1. **Siempre usa la versión mejorada** para sincronizaciones importantes
2. **Monitorea en tiempo real** durante sincronizaciones largas
3. **Revisa los logs** después de cada sincronización
4. **Ejecuta verify_data.py** para validar integridad
5. **Mantén backups** de datos importantes
6. **Configura notificaciones** para errores críticos
