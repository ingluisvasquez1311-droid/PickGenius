@echo off
echo ============================================================
echo 🏀 SINCRONIZACIÓN DE DATOS NBA - TIRENS PARLEYS
echo ============================================================
echo.

echo 🔍 Verificando Python...
python --version
if errorlevel 1 (
    echo ❌ Python no encontrado
    echo Por favor instala Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo 📦 Instalando dependencias...
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 🔍 Verificando credenciales Firebase...
if not exist firebase-credentials.json (
    echo ❌ Archivo firebase-credentials.json no encontrado
    pause
    exit /b 1
)

echo.
echo 🧪 Ejecutando verificación completa...
python src\scripts\verify_setup.py
if errorlevel 1 (
    echo ❌ Verificación falló
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ✅ VERIFICACIÓN EXITOSA - LISTO PARA SINCRONIZAR
echo ============================================================
echo.
echo Opciones disponibles:
echo 1. Sincronización completa (fetch_missing_data.py)
echo    - Rellena huecos 2023-24 (PHI, MIA)
echo    - Obtiene temporada completa 2025-26 (todos los equipos)
echo.
echo 2. Detectar y rellenar huecos (find_and_fill_gaps.py)
echo    - Escanea datos existentes
echo    - Solo obtiene lo que falta
echo.
echo 3. Salir
echo.

set /p option="Selecciona una opción (1/2/3): "

if "%option%"=="1" (
    echo.
    echo ⚠️  ADVERTENCIA: Este proceso puede tomar varias horas
    echo    La API de NBA tiene rate limits
    echo.
    set /p confirm="¿Deseas continuar? (S/N): "
    if /i "%confirm%"=="S" (
        echo.
        echo 🚀 Ejecutando sincronización completa...
        python src\scripts\fetch_missing_data.py
    )
)

if "%option%"=="2" (
    echo.
    echo 🚀 Ejecutando detección y relleno de huecos...
    python src\scripts\find_and_fill_gaps.py
)

echo.
echo ============================================================
echo Script finalizado
echo ============================================================
pause
