const axios = require('axios');

async function testEndpoints() {
    const eventId = '14434378'; // El ID que falló en la imagen
    const endpoints = [
        `http://localhost:3001/api/sofascore/basketball/game/${eventId}`,
        `http://localhost:3001/api/sofascore/basketball/game/${eventId}/stats`,
        `http://localhost:3001/api/sofascore/basketball/game/${eventId}/lineups`
    ];

    console.log('Diagnosticar API Endpoints...');

    for (const url of endpoints) {
        try {
            console.log(`\nProbando: ${url}`);
            const response = await axios.get(url, { validateStatus: () => true }); // Aceptar cualquier status

            console.log(`Status: ${response.status}`);
            const contentType = response.headers['content-type'];
            console.log(`Content-Type: ${contentType}`);

            if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
                console.log('⚠️ ERROR: La respuesta es HTML (probablemente error 404 o 500 del servidor web)');
                console.log('Preview:', response.data.substring(0, 100));
            } else {
                console.log('✅ Respuesta JSON válida');
            }
        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
        }
    }
}

testEndpoints();
