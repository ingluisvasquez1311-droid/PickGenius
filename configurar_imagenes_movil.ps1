# 🚀 Script de Configuración Automática para Imágenes Móviles
# Este script verifica y configura todo lo necesario para que las imágenes funcionen en móvil

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PICKGENIUS - CONFIGURACIÓN MÓVIL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si el backend está corriendo
Write-Host "[1/4] Verificando backend..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet

if ($backendRunning) {
    Write-Host "✅ Backend está corriendo en puerto 3001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend NO está corriendo" -ForegroundColor Red
    Write-Host "Iniciando backend..." -ForegroundColor Yellow
    
    # Iniciar backend en nueva ventana
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Daniel\PickGenius; node server.js"
    
    Write-Host "⏳ Esperando 5 segundos para que el backend inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    $backendRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet
    if ($backendRunning) {
        Write-Host "✅ Backend iniciado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ No se pudo iniciar el backend automáticamente" -ForegroundColor Red
        Write-Host "Por favor, ejecuta manualmente: node server.js" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Verificar si ngrok está disponible
Write-Host "[2/4] Verificando ngrok..." -ForegroundColor Yellow
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if ($null -eq $ngrokPath) {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host "Descárgalo de: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "O instala con Chocolatey: choco install ngrok" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ ngrok encontrado: $($ngrokPath.Source)" -ForegroundColor Green
}

Write-Host ""

# Instrucciones para ngrok
Write-Host "[3/4] PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1. ABRE UNA NUEVA TERMINAL y ejecuta:" -ForegroundColor Cyan
Write-Host "   ngrok http 3001" -ForegroundColor White
Write-Host ""
Write-Host "2. COPIA la URL pública que aparece, ejemplo:" -ForegroundColor Cyan
Write-Host "   https://abc123-456-789.ngrok-free.app" -ForegroundColor White
Write-Host ""
Write-Host "3. VE A VERCEL:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "4. ACTUALIZA la variable de entorno:" -ForegroundColor Cyan
Write-Host "   - Variable: NEXT_PUBLIC_API_URL" -ForegroundColor White
Write-Host "   - Valor: [tu URL de ngrok]" -ForegroundColor White
Write-Host "   - Aplica a: Production, Preview, Development" -ForegroundColor White
Write-Host ""
Write-Host "5. REDEPLOY el proyecto en Vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Esperar confirmación
Write-Host "[4/4] Verificación final" -ForegroundColor Yellow
Write-Host "¿Has completado los pasos anteriores? (S/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "✅ ¡CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prueba ahora en tu móvil:" -ForegroundColor Yellow
    Write-Host "https://pickgeniuspro.vercel.app" -ForegroundColor White
    Write-Host ""
    Write-Host "Las imágenes de equipos y jugadores deberían cargar correctamente 📱" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Completa los pasos y vuelve a ejecutar este script." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
