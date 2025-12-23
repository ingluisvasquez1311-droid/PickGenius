const fetch = require('node-fetch');

async function testStealthFetch() {
    const url = 'https://api.sofascore.com/api/v1/sport/football/events/live';
    const stealthHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Cache-Control': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
    };

    console.log(`🔍 Probando conexión Mimetizada a Sofascore...`);
    try {
        const response = await fetch(url, { headers: stealthHeaders });
        console.log(`📡 Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            const count = data.events ? data.events.length : 0;
            console.log(`✅ EXITO: Se encontraron ${count} partidos en vivo.`);
            console.log(`🌐 Tu IP residencial está funcionando correctamente con el mimetismo.`);
        } else {
            console.error(`❌ ERROR: Sofascore bloqueó la petición con status ${response.status}`);
            console.log(`Detalle: ${await response.text().catch(() => "N/A")}`);
        }
    } catch (err) {
        console.error(`❌ FALLO DE CONEXION: ${err.message}`);
    }
}

testStealthFetch();
