@echo off
echo ========================================
echo   PickGenius - Inicio Automatico Local
echo ========================================
echo.

REM Verificar si Redis ya esta corriendo
tasklist | findstr redis-server.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [1/3] Redis ya esta corriendo (OK)
) else (
    echo [1/3] Iniciando Redis...
    start "Redis Server" cmd /k "redis-server"
    timeout /t 3 /nobreak >nul
)

echo [2/3] Instalando dependencias de Next.js (si es necesario)...
cd web
call npm install --silent

echo [3/3] Iniciando Next.js en http://localhost:3000...
start "Next.js Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   TODOS LOS SERVICIOS INICIADOS
echo ========================================
echo.
echo Redis:    http://localhost:6379
echo Next.js:  http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
