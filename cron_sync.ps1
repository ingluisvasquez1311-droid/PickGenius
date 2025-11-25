# Script de cron job para sincronización automática diaria
# Para Windows Task Scheduler

# Configuración
$SCRIPT_DIR = "c:\Users\Daniel\PickGenius"
$LOG_DIR = "$SCRIPT_DIR\logs\cron"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$LOG_FILE = "$LOG_DIR\cron_$TIMESTAMP.log"

# Crear directorio de logs si no existe
if (!(Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# Función de logging
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Output $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

Write-Log "=== Iniciando sincronización automática ==="

# Cambiar al directorio del proyecto
Set-Location $SCRIPT_DIR

# 1. Verificar que Python está disponible
Write-Log "Verificando Python..."
try {
    $pythonVersion = python --version 2>&1
    Write-Log "Python encontrado: $pythonVersion"
} catch {
    Write-Log "ERROR: Python no encontrado"
    exit 1
}

# 2. Ejecutar sincronización con script mejorado
Write-Log "Ejecutando sincronización..."
try {
    python src\scripts\fetch_missing_data_improved.py 2>&1 | Tee-Object -Append -FilePath $LOG_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Sincronización completada exitosamente"
    } else {
        Write-Log "⚠️ Sincronización completada con errores (exit code: $LASTEXITCODE)"
    }
} catch {
    Write-Log "ERROR: Fallo en sincronización - $_"
    exit 1
}

# 3. Ejecutar verificación de datos
Write-Log "Verificando integridad de datos..."
try {
    python src\scripts\verify_data.py 2>&1 | Tee-Object -Append -FilePath $LOG_FILE
    Write-Log "✅ Verificación completada"
} catch {
    Write-Log "WARNING: Error en verificación - $_"
}

# 4. Limpiar logs antiguos (mantener últimos 30 días)
Write-Log "Limpiando logs antiguos..."
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem -Path $LOG_DIR -Filter "cron_*.log" | 
    Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
    ForEach-Object {
        Write-Log "Eliminando log antiguo: $($_.Name)"
        Remove-Item $_.FullName -Force
    }

Write-Log "=== Sincronización automática finalizada ==="
Write-Log "Log guardado en: $LOG_FILE"

# Enviar notificación (si está configurado)
if (Test-Path "$SCRIPT_DIR\src\services\notificationService.py") {
    Write-Log "Enviando notificación..."
    python -c "from src.services.notificationService import NotificationService; NotificationService().send_success_notification({'status': 'completed'})" 2>&1 | Out-Null
}

exit 0
