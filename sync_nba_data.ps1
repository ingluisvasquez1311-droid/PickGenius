# Script de sincronización NBA - Tirens Parleys
# Este script verifica el entorno y ejecuta la sincronización de datos

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🏀 SINCRONIZACIÓN DE DATOS NBA - TIRENS PARLEYS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar Python
function Test-Python {
    Write-Host "🔍 Verificando Python..." -ForegroundColor Yellow
    
    $pythonCommands = @('python', 'py', 'python3')
    $pythonCmd = $null
    
    foreach ($cmd in $pythonCommands) {
        try {
            $version = & $cmd --version 2>&1 | Out-String
            if ($LASTEXITCODE -eq 0 -or $version -match "Python") {
                Write-Host "✅ Encontrado: $cmd" -ForegroundColor Green
                Write-Host "   Versión: $version" -ForegroundColor Gray
                $pythonCmd = $cmd
                break
            }
        }
        catch {
            continue
        }
    }
    
    if (-not $pythonCmd) {
        Write-Host "❌ Python NO encontrado" -ForegroundColor Red
        Write-Host ""
        Write-Host "Por favor instala Python desde: https://www.python.org/downloads/" -ForegroundColor Yellow
        Write-Host "Asegúrate de marcar 'Add Python to PATH' durante la instalación" -ForegroundColor Yellow
        return $null
    }
    
    return $pythonCmd
}

# Función para instalar dependencias
function Install-Dependencies {
    param($pythonCmd)
    
    Write-Host ""
    Write-Host "📦 Verificando dependencias Python..." -ForegroundColor Yellow
    
    $pipCmd = "$pythonCmd -m pip"
    
    Write-Host "Instalando dependencias desde requirements.txt..." -ForegroundColor Gray
    & $pythonCmd -m pip install -r requirements.txt --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        return $false
    }
}

# Función para verificar Firebase
function Test-FirebaseCredentials {
    Write-Host ""
    Write-Host "🔍 Verificando credenciales Firebase..." -ForegroundColor Yellow
    
    if (Test-Path "firebase-credentials.json") {
        Write-Host "✅ Archivo firebase-credentials.json encontrado" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ Archivo firebase-credentials.json NO encontrado" -ForegroundColor Red
        Write-Host "   Por favor asegúrate de tener el archivo de credenciales en la raíz del proyecto" -ForegroundColor Yellow
        return $false
    }
}

# Función para ejecutar script de verificación
function Invoke-VerificationScript {
    param($pythonCmd)
    
    Write-Host ""
    Write-Host "🧪 Ejecutando verificación completa..." -ForegroundColor Yellow
    Write-Host ""
    
    & $pythonCmd src\scripts\verify_setup.py
    
    return $LASTEXITCODE -eq 0
}

# Función para ejecutar sincronización
function Invoke-Sync {
    param($pythonCmd, $scriptName)
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "🚀 INICIANDO SINCRONIZACIÓN: $scriptName" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  ADVERTENCIA: Este proceso puede tomar varias horas" -ForegroundColor Yellow
    Write-Host "   La API de NBA tiene rate limits, por eso hay delays entre peticiones" -ForegroundColor Yellow
    Write-Host ""
    
    $confirmation = Read-Host "¿Deseas continuar? (S/N)"
    
    if ($confirmation -eq 'S' -or $confirmation -eq 's') {
        Write-Host ""
        Write-Host "Ejecutando $scriptName..." -ForegroundColor Green
        Write-Host ""
        
        & $pythonCmd "src\scripts\$scriptName"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Sincronización completada exitosamente" -ForegroundColor Green
        }
        else {
            Write-Host ""
            Write-Host "❌ Error durante la sincronización" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Sincronización cancelada por el usuario" -ForegroundColor Yellow
    }
}

# MAIN SCRIPT
$pythonCmd = Test-Python

if ($pythonCmd) {
    $depsOk = Install-Dependencies -pythonCmd $pythonCmd
    
    if ($depsOk) {
        $firebaseOk = Test-FirebaseCredentials
        
        if ($firebaseOk) {
            $verifyOk = Invoke-VerificationScript -pythonCmd $pythonCmd
            
            if ($verifyOk) {
                Write-Host ""
                Write-Host "============================================================" -ForegroundColor Green
                Write-Host "✅ VERIFICACIÓN EXITOSA - LISTO PARA SINCRONIZAR" -ForegroundColor Green
                Write-Host "============================================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Opciones disponibles:" -ForegroundColor Cyan
                Write-Host "1. Sincronización completa (fetch_missing_data.py)" -ForegroundColor White
                Write-Host "   - Rellena huecos 2023-24 (PHI, MIA)" -ForegroundColor Gray
                Write-Host "   - Obtiene temporada completa 2025-26 (todos los equipos)" -ForegroundColor Gray
                Write-Host ""
                Write-Host "2. Detectar y rellenar huecos (find_and_fill_gaps.py)" -ForegroundColor White
                Write-Host "   - Escanea datos existentes" -ForegroundColor Gray
                Write-Host "   - Solo obtiene lo que falta" -ForegroundColor Gray
                Write-Host ""
                
                $option = Read-Host "Selecciona una opción (1/2) o presiona Enter para salir"
                
                switch ($option) {
                    "1" { Invoke-Sync -pythonCmd $pythonCmd -scriptName "fetch_missing_data.py" }
                    "2" { Invoke-Sync -pythonCmd $pythonCmd -scriptName "find_and_fill_gaps.py" }
                    default { Write-Host "Saliendo..." -ForegroundColor Yellow }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Script finalizado" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
