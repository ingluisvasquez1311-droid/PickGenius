@echo off
echo ====================================
echo LIMPIEZA Y ARRANQUE DE PICKGENIUS
echo ====================================
echo.

REM Detener procesos existentes
echo [1/5] Deteniendo procesos existentes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Limpiar caches del frontend
echo [2/5] Limpiando caches del frontend...
cd web
if exist ".next" rmdir /S /Q ".next"
if exist "node_modules\.cache" rmdir /S /Q "node_modules\.cache"
echo    - Caches limpiados
cd ..

REM Reinstalar dependencias del frontend
echo [3/5] Reinstalando dependencias del frontend...
cd web
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..

REM Iniciar backend (Nuevo Robot Bridge)
echo [4/5] Iniciando servidor backend (puerto 3001)...
start "PickGenius Backend" cmd /k "cd backend && node server.js"
timeout /t 5 /nobreak >nul

REM Iniciar frontend
echo [5/5] Iniciando servidor frontend (puerto 3000)...
cd web
start "PickGenius Frontend" cmd /k "npm run dev"
cd ..

REM Iniciar Ngrok (Tunnel para acceso externo)
echo [EXTRA] Iniciando Ngrok en puerto 3001 con dominio personalizado...
start "Ngrok Tunnel" cmd /k "ngrok http --domain=unconsultative-lore-unlovely.ngrok-free.dev 3001"

echo.
echo ====================================
echo SERVIDORES INICIADOS
echo ====================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
