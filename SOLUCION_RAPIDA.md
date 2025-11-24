# 🎯 SOLUCIÓN RÁPIDA - Ejecutar Sincronización

## Problema Actual

El dashboard muestra "Connection error" porque:
1. Las colecciones están vacías (0 documentos)
2. No hay datos para mostrar

## Solución: Ejecutar Sincronización

### Paso 1: Ejecutar Script de Sincronización

Abre una **nueva terminal PowerShell** y ejecuta:

```powershell
# Ir al directorio del proyecto
cd "c:\Users\Daniel\Tiren Parleys"

# Activar entorno virtual
& "c:/Users/Daniel/Tiren Parleys/.venv/Scripts/Activate.ps1"

# Ejecutar sincronización
python src\scripts\fetch_missing_data.py
```

### Paso 2: Esperar

La sincronización tomará **2-4 horas**. Verás mensajes como:

```
=== FASE 1: Rellenando huecos 2023-24 (PHI, MIA) ===
🏀 Procesando PHI para temporada 2023-24
  Encontrados 82 juegos.
  ✅ Guardados 1,230 registros...
```

### Paso 3: Monitorear (Opcional)

En **otra terminal** puedes monitorear el progreso:

```powershell
cd "c:\Users\Daniel\Tiren Parleys"
& "c:/Users/Daniel/Tiren Parleys/.venv/Scripts/Activate.ps1"
python src\scripts\monitor_sync.py summary
```

### Paso 4: Actualizar Dashboard

Una vez que empiece a haber datos:
1. El dashboard se actualizará automáticamente si tienes "Auto-refresh" activado
2. O simplemente recarga la página del navegador

## Alternativa Rápida: Datos de Prueba

Si quieres ver el dashboard funcionando AHORA sin esperar 2-4 horas, puedo crear un script que genere datos de prueba en Firestore. ¿Te interesa?

## Comandos Útiles

```powershell
# Ver si ya hay datos
python src\scripts\monitor_sync.py summary

# Ver logs en tiempo real
Get-Content logs\sync_*.log -Tail 50 -Wait

# Verificar Firebase
python src\scripts\test_firebase.py
```

## ¿Qué Hacer Ahora?

**Opción 1**: Ejecutar sincronización real (2-4 horas)
```powershell
python src\scripts\fetch_missing_data.py
```

**Opción 2**: Crear datos de prueba (2 minutos)
- Te creo un script que genera datos de ejemplo
- Puedes ver el dashboard funcionando inmediatamente
- Luego puedes ejecutar la sincronización real

**Opción 3**: Usar solo la temporada actual (más rápido)
- Modificar el script para obtener solo últimos 30 días
- Toma ~30 minutos en lugar de 2-4 horas

¿Cuál prefieres? 🏀
