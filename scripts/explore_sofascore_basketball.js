const sofaScoreService = require('../src/services/football/sofaScoreService');
const axios = require('axios');

/**
 * Test para explorar endpoints de baloncesto en SofaScore
 */
async function exploreSofaScoreBasketball() {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'es-419,es-US;q=0.9,es;q=0.8,en;q=0.7',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
    };

    console.log('🏀 Explorando SofaScore para NBA/Baloncesto\n');

    // 1. Eventos en vivo de baloncesto
    console.log('1️⃣ Obteniendo eventos en vivo de baloncesto...');
    try {
        const response = await axios.get('https://www.sofascore.com/api/v1/sport/basketball/events/live', { headers });
        console.log(`✅ ${response.data.events?.length || 0} eventos en vivo`);

        if (response.data.events && response.data.events.length > 0) {
            const firstEvent = response.data.events[0];
            const eventId = firstEvent.id;
            console.log(`\nEjemplo: ${firstEvent.homeTeam?.name} vs ${firstEvent.awayTeam?.name}`);
            console.log(`Event ID: ${eventId}`);
            console.log(`Score: ${firstEvent.homeScore?.current || 0} - ${firstEvent.awayScore?.current || 0}\n`);

            // 2. Estadísticas del evento
            console.log('2️⃣ Obteniendo estadísticas del juego...');
            const statsResponse = await axios.get(`https://www.sofascore.com/api/v1/event/${eventId}/statistics`, { headers });
            console.log('✅ Estadísticas obtenidas:');
            console.log(JSON.stringify(statsResponse.data, null, 2).substring(0, 500) + '...\n');

            // 3. Obtener jugador específico (necesitaremos ID de jugador)
            console.log('3️⃣ Intentando obtener datos de jugadores...');

            // Primero obtener lineups para conseguir IDs de jugadores
            const lineupsResponse = await axios.get(`https://www.sofascore.com/api/v1/event/${eventId}/lineups`, { headers });

            if (lineupsResponse.data.home?.players) {
                const firstPlayer = lineupsResponse.data.home.players[0];
                const playerId = firstPlayer.player?.id;

                if (playerId) {
                    console.log(`\nJugador ejemplo: ${firstPlayer.player.name} (ID: ${playerId})`);

                    // 4. Estadísticas del jugador
                    console.log('4️⃣ Obteniendo estadísticas del jugador...');
                    try {
                        const playerStatsResponse = await axios.get(`https://www.sofascore.com/api/v1/player/${playerId}/statistics`, { headers });
                        console.log('✅ Estadísticas del jugador obtenidas:');
                        console.log(JSON.stringify(playerStatsResponse.data, null, 2).substring(0, 500) + '...\n');
                    } catch (error) {
                        console.log('❌ Error obteniendo stats de jugador:', error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // 5. Temporada NBA actual
    console.log('\n5️⃣ Obteniendo información de temporada NBA...');
    try {
        // ID de la NBA en SofaScore (puede variar)
        const nbaLeagueId = 132; // NBA
        const season = '2024'; // Temporada actual

        const standingsResponse = await axios.get(
            `https://www.sofascore.com/api/v1/unique-tournament/${nbaLeagueId}/season/${season}/standings/total`,
            { headers }
        );
        console.log('✅ Standings de la NBA obtenidos\n');
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n✅ Exploración completada');
}

exploreSofaScoreBasketball().catch(console.error);
