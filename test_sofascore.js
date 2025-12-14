const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer node

async function testSofascore() {
    console.log('Testing Sofascore connection...');
    try {
        const response = await fetch('https://www.sofascore.com/api/v1/sport/basketball/events/live', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com'
            }
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Response text:', await response.text());
        } else {
            const data = await response.json();
            console.log('Success. Data length:', data.events ? data.events.length : 'unknown');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testSofascore();
