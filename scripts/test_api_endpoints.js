const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSofaScoreAPI() {
    console.log('🧪 Probando API Endpoints de SofaScore\n');
    console.log('='.repeat(60));

    // Test 1: Basketball Live
    console.log('\n1️⃣ GET /api/sofascore/basketball/live');
    try {
        const response = await axios.get(`${BASE_URL}/api/sofascore/basketball/live`);
        console.log(`✅ Status: ${response.status}`);
        console.log(`   Eventos: ${response.data.data?.length || 0}`);
        console.log(`   Cache: ${response.data.fromCache ? 'HIT' : 'MISS'}`);

        if (response.data.data && response.data.data.length > 0) {
            const firstEvent = response.data.data[0];
            const eventId = firstEvent.id;
            console.log(`   Ejemplo: ${firstEvent.homeTeam?.name} vs ${firstEvent.awayTeam?.name}`);

            // Test 2: Basketball Game Stats
            console.log('\n2️⃣ GET /api/sofascore/basketball/game/' + eventId + '/stats');
            const statsResponse = await axios.get(`${BASE_URL}/api/sofascore/basketball/game/${eventId}/stats`);
            console.log(`✅ Status: ${statsResponse.status}`);
            console.log(`   Cache: ${statsResponse.data.fromCache ? 'HIT' : 'MISS'}`);

            if (statsResponse.data.data && statsResponse.data.data.periods) {
                const allPeriod = statsResponse.data.data.periods.find(p => p.period === 'ALL');
                if (allPeriod) {
                    console.log(`   Estadísticas disponibles:`);
                    console.log(`     - Scoring: ${Object.keys(allPeriod.scoring).length} categorías`);
                    console.log(`     - Rebounds: ${Object.keys(allPeriod.rebounds).length} categorías`);
                    console.log(`     - Other: ${Object.keys(allPeriod.other).length} categorías`);
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 3: Football Live
    console.log('\n3️⃣ GET /api/sofascore/football/live');
    try {
        const response = await axios.get(`${BASE_URL}/api/sofascore/football/live`);
        console.log(`✅ Status: ${response.status}`);
        console.log(`   Partidos: ${response.data.data?.length || 0}`);
        console.log(`   Cache: ${response.data.fromCache ? 'HIT' : 'MISS'}`);

        if (response.data.data && response.data.data.length > 0) {
            const firstMatch = response.data.data[0];
            const matchId = firstMatch.id;
            console.log(`   Ejemplo: ${firstMatch.homeTeam?.name} vs ${firstMatch.awayTeam?.name}`);

            // Test 4: Football Match Stats
            console.log('\n4️⃣ GET /api/sofascore/football/match/' + matchId + '/stats');
            const statsResponse = await axios.get(`${BASE_URL}/api/sofascore/football/match/${matchId}/stats`);
            console.log(`✅ Status: ${statsResponse.status}`);
            console.log(`   Cache: ${statsResponse.data.fromCache ? 'HIT' : 'MISS'}`);

            // Test 5: Football Lineups
            console.log('\n5️⃣ GET /api/sofascore/football/match/' + matchId + '/lineups');
            const lineupsResponse = await axios.get(`${BASE_URL}/api/sofascore/football/match/${matchId}/lineups`);
            console.log(`✅ Status: ${lineupsResponse.status}`);
            console.log(`   Cache: ${lineupsResponse.data.fromCache ? 'HIT' : 'MISS'}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Prueba completada');
}

testSofaScoreAPI().catch(console.error);
