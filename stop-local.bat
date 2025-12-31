@echo off
echo Deteniendo todos los servicios de PickGenius...

REM Matar procesos de Redis
taskkill /F /IM redis-server.exe >nul 2>&1

REM Matar procesos de Node (Next.js)
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Todos los servicios han sido detenidos.
pause
