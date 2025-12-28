@echo off
echo 🚀 Iniciando Backend (Dual Backend 2.0)...
echo 🌐 Iniciando Ngrok Tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http --domain=unconsultative-lore-unlovely.ngrok-free.dev 3001"
cd backend
node server.js
pause
