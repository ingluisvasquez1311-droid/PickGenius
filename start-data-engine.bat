@echo off
echo ========================================
echo   PickGenius - Motor de Datos (Scraper)
echo ========================================
echo.

echo Activando entorno virtual...
call .venv\Scripts\activate

echo.
echo Iniciando el Scraper en modo Bucle...
echo Este proceso actualizara Redis cada 60 segundos.
echo NO CIERRES ESTA VENTANA si quieres datos en vivo.
echo.

python python/pro_test_ia.py --loop

pause
