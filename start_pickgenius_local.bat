@echo off
echo ===================================================
echo 🚀 INICIANDO PICKGENIUS LOCAL ECOSYSTEM
echo ===================================================

echo.
echo [1/3] Iniciando la Base de Datos Redis y Scraper Engine...
echo (Se abrira una ventana de navegador VISIBLE para capturar datos en vivo)
start "PickGenius Engine (Python)" cmd /k ".venv\Scripts\python.exe python/background_service.py"

echo.
echo [2/3] Iniciando Servidor Web (Next.js)...
cd web
start "PickGenius Web (Next.js)" cmd /k "npm run dev"

echo.
echo [3/3] Listo!
echo - El Motor de Datos esta corriendo en la otra ventana.
echo - La Web estara lista en unos segundos en: http://localhost:3000
echo.
pause
