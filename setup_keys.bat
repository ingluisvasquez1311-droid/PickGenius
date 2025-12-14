@echo off
setlocal
cd web
echo.
echo ========================================================
echo      CONFIGURACION DE CLAVES LOCALES (PickGenius)
echo ========================================================
echo.
echo Para que la Web App funcione localmente y no de Error 500,
echo necesitamos configurar tus claves de API.
echo.
echo (Si ya tienes una clave configurada, dale Enter para saltar)
echo.

set /p NBA_KEY=89366504adcb0bd1a9aabc84eaf6838e
set /p FOOTBALL_KEY=89366504adcb0bd1a9aabc84eaf6838e
set /p GROQ_KEY=45l2t3CJRILOERRz6fOBWGdyb3FY1VBWD3iGnlc8p1V3TVYVKXaQ

echo.
echo Guardando en .env.local ...

if not "%NBA_KEY%"=="" echo NBA_API_KEY=%NBA_KEY% >> .env.local
if not "%FOOTBALL_KEY%"=="" echo FOOTBALL_API_KEY_1=%FOOTBALL_KEY% >> .env.local
if not "%GROQ_KEY%"=="" echo GROQ_API_KEY=%GROQ_KEY% >> .env.local
if not "%GROQ_KEY%"=="" echo NEXT_PUBLIC_API_URL=http://localhost:3000 >> .env.local

echo.
echo ========================================================
echo                CONFIGURACION COMPLETADA
echo ========================================================
echo.
echo Ahora reinicia el servidor web con:
echo .\start_web.bat
echo.
pause
