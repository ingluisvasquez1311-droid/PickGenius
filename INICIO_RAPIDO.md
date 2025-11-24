# 🚀 Guía de Inicio Rápido - Sincronización NBA

## Estado Actual

Las colecciones están vacías (0 documentos). Necesitas ejecutar la sincronización.

## Pasos para Sincronizar Datos

### 1. Verificar Credenciales Firebase

Asegúrate de que existe `firebase-credentials.json` en la raíz del proyecto:

```powershell
Test-Path firebase-credentials.json
```

Si retorna `False`, necesitas:
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar tu proyecto
3. Ir a Project Settings > Service Accounts
4. Generar nueva clave privada
5. Guardar como `firebase-credentials.json` en la raíz

### 2. Ejecutar Sincronización

Tienes dos opciones:

#### Opción A: Script Básico (Más rápido para probar)

```powershell
python src\scripts\fetch_missing_data.py
```

Este script:
- FASE 1: Rellena huecos 2023-24 (PHI, MIA)
- FASE 2: Obtiene temporada 2024-25 (30 equipos)

⏱️ **Tiempo estimado**: 2-4 horas

#### Opción B: Script Mejorado (Recomendado)

```powershell
python src\scripts\fetch_missing_data_improved.py
```

Este script incluye:
- ✅ Retry automático
- ✅ Logging detallado
- ✅ Manejo robusto de errores
- ✅ Estadísticas completas

⏱️ **Tiempo estimado**: 2-4 horas

### 3. Monitorear Progreso

Mientras se ejecuta la sincronización, en **otra terminal**:

```powershell
# Activar entorno virtual
& "c:/Users/Daniel/Tiren Parleys/.venv/Scripts/Activate.ps1"

# Monitorear en tiempo real (cada 30 segundos durante 120 minutos)
python src\scripts\monitor_sync.py monitor nba_regular_season_box_scores_2024_25 30 120
```

### 4. Ver Dashboard

El dashboard se actualizará automáticamente cuando haya datos:

```powershell
streamlit run dashboard.py
```

Activa **"Auto-refresh"** en el sidebar para ver actualizaciones en tiempo real.

## Troubleshooting

### Error: "firebase-credentials.json no encontrado"

1. Descarga credenciales de Firebase Console
2. Guarda en raíz del proyecto
3. Verifica con: `Test-Path firebase-credentials.json`

### Error: "Permission denied"

- Verifica que las credenciales tengan permisos de escritura
- Revisa reglas de Firestore en Firebase Console

### Sincronización muy lenta

Es normal. La NBA API tiene rate limits:
- ~0.5-1 segundo entre requests
- 30 equipos × ~82 juegos = muchos requests
- Tiempo total: 2-4 horas

### Ver progreso en logs

```powershell
# Ver últimas líneas del log
Get-Content logs\sync_*.log -Tail 50 -Wait
```

## Verificar Después de Sincronización

```powershell
# Ver resumen
python src\scripts\monitor_sync.py summary

# Verificar integridad
python src\scripts\verify_data.py
```

## Datos Esperados

### Colección 2023-24 (PHI, MIA)
- **Equipos**: 2
- **Documentos esperados**: ~2,460

### Colección 2024-25 (Todos)
- **Equipos**: 30
- **Documentos esperados**: Variable (temporada en curso)

## Próximos Pasos

1. ✅ Verificar `firebase-credentials.json`
2. 🔄 Ejecutar sincronización
3. 📊 Monitorear progreso
4. ✅ Verificar datos
5. 🎉 Disfrutar del dashboard

---

**Nota**: La primera sincronización toma tiempo. Una vez completada, puedes usar `autoSyncService.js` para actualizaciones incrementales diarias.
