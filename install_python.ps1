# Script para descargar e instalar Python automáticamente
# Ejecutar como administrador si es posible

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🐍 INSTALADOR AUTOMÁTICO DE PYTHON" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Detectar arquitectura del sistema
$arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "win32" }
$pythonVersion = "3.12.0"
$installerUrl = "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-$arch.exe"
$installerPath = "$env:TEMP\python-installer.exe"

Write-Host "📥 Descargando Python $pythonVersion para $arch..." -ForegroundColor Yellow
Write-Host "URL: $installerUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Descargar instalador
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Descarga completada" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔧 Instalando Python..." -ForegroundColor Yellow
    Write-Host "   - Se agregará Python al PATH automáticamente" -ForegroundColor Gray
    Write-Host "   - Se instalará pip" -ForegroundColor Gray
    Write-Host ""
    
    # Instalar Python silenciosamente con opciones importantes
    $installArgs = @(
        "/quiet",                    # Instalación silenciosa
        "InstallAllUsers=0",         # Solo para usuario actual
        "PrependPath=1",             # ⭐ AGREGAR AL PATH
        "Include_pip=1",             # Incluir pip
        "Include_test=0",            # No incluir tests
        "Include_doc=0"              # No incluir documentación
    )
    
    Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -NoNewWindow
    
    Write-Host "✅ Instalación completada" -ForegroundColor Green
    Write-Host ""
    
    # Limpiar instalador
    Remove-Item $installerPath -Force
    
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "✅ PYTHON INSTALADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Cierra y abre una NUEVA terminal PowerShell" -ForegroundColor Yellow
    Write-Host "   para que los cambios del PATH tomen efecto" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Luego verifica con:" -ForegroundColor Cyan
    Write-Host "   python --version" -ForegroundColor White
    Write-Host ""
    Write-Host "Y ejecuta la sincronización con:" -ForegroundColor Cyan
    Write-Host "   .\sync_nba_data.bat" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Error durante la instalación: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Descarga manualmente desde:" -ForegroundColor Yellow
    Write-Host "https://www.python.org/downloads/" -ForegroundColor White
}

Write-Host "============================================================" -ForegroundColor Cyan
