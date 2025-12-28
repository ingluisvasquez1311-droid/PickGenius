@echo off
setlocal
title PickGenius Launcher - Control Center 🚀
color 0a

echo.
echo  ⚡ INICIANDO ENTORNO PICKGENIUS (MODO MULTI-WINDOW)
echo  ----------------------------------------------------------------------

:: 1. Ngrok (Segundo plano/Minimizado)
echo  [1/3] 🌐 Verificando Ngrok...
tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo      [OK] Ngrok ya esta activo.
) else (
    echo      [+] Lanzando Ngrok...
    start "Genius Ngrok" /min cmd /c "ngrok http --domain=unconsultative-lore-unlovely.ngrok-free.dev 3001"
)

:: 2. Backend (Nueva Ventana)
echo  [2/3] 🚀 Arrancando Backend (Puerto 3001)...
start "Genius Backend [3001]" cmd /k "cd backend && node server.js"

:: 3. Frontend (Nueva Ventana con Turbo)
echo  [3/3] 🔥 Arrancando Frontend (Puerto 3000 - TURBO)...
start "Genius Web [3000]" cmd /k "cd web && npm run dev:turbo"

echo  ----------------------------------------------------------------------
echo  ✅ ¡SISTEMAS LANZADOS! 
echo.
echo  - Puedes cerrar esta ventana.
echo  - Los logs de cada servicio estan en sus propias ventanas.
echo  ----------------------------------------------------------------------
timeout /t 5
exit
