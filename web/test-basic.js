const https = require('https');

console.log("1. Iniciando prueba básica de conectividad...");

https.get('https://api.groq.com/openai/v1/models', (resp) => {
    console.log('2. Conectado a Groq API (Estado: ' + resp.statusCode + ')');

    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        console.log("3. Respuesta recibida (longitud: " + data.length + ")");
        console.log("✅ Conectividad básica OK");
    });

}).on("error", (err) => {
    console.log("❌ Error de conexión: " + err.message);
});

console.log("4. Solicitud enviada, esperando...");
