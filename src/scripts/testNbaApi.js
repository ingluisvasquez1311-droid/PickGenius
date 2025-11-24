const axios = require('axios');

const gameId = '0022400255'; // Example Game ID (PHI vs MIA from recent logs)
// Note: Game ID 18447061 from user logs looks like a different ID format (maybe internal or from another source).
// Let's try to fetch a known recent game or use the one provided if valid for stats.nba.com
// The user's game ID 18447061 might be from balldontlie.io which uses different IDs?
// Let's try to fetch the game the user is interested in: PHI vs MIA.
// 18447061 seems to be the ID the user is using. Let's try that first, but also a standard NBA ID.

async function testNbaEndpoint(endpoint, id) {
    const url = `https://stats.nba.com/stats/${endpoint}`;
    const headers = {
        'Host': 'stats.nba.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
        'Connection': 'keep-alive',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true'
    };

    const params = {
        GameID: id,
        LeagueID: '00',
        endPeriod: '0',
        endRange: '0',
        rangeType: '0',
        startPeriod: '0',
        startRange: '0'
    };

    console.log(`Testing ${url} with GameID: ${id}...`);

    try {
        const response = await axios.get(url, { headers, params });
        console.log(`✅ Success! Status: ${response.status}`);
        const data = response.data;
        if (data.resultSets) {
            console.log('Data found:', data.resultSets[0].name);
            console.log('Row count:', data.resultSets[0].rowSet.length);
            if (data.resultSets[0].rowSet.length > 0) {
                console.log('Sample row:', data.resultSets[0].rowSet[0]);
            }
        } else {
            console.log('Structure:', Object.keys(data));
        }
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return false;
    }
}

async function run() {
    // Try V3 first
    console.log('--- Attempting V3 ---');
    const v3Success = await testNbaEndpoint('boxscoretraditionalv3', '0022400255'); // Using a real NBA ID for testing

    if (!v3Success) {
        console.log('\n--- Attempting V2 ---');
        await testNbaEndpoint('boxscoretraditionalv2', '0022400255');
    }
}

run();
