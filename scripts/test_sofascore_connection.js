const axios = require('axios');

async function testSofaScore() {
    const url = 'https://www.sofascore.com/api/v1/sport/football/events/live';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'es-419,es-US;q=0.9,es;q=0.8,en;q=0.7',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
    };

    console.log(`Testing connection to: ${url}`);

    try {
        const response = await axios.get(url, { headers });
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data preview:', JSON.stringify(response.data).substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else {
            console.error(error.message);
        }
    }
}

testSofaScore();
