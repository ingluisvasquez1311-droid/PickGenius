const axios = require('axios');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'es-419,es-US;q=0.9,es;q=0.8,en;q=0.7',
    'Referer': 'https://www.sofascore.com/',
    'Origin': 'https://www.sofascore.com',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive'
};

async function findAndTestNBA() {
    console.log('🏀 Buscando partido de NBA específico\n');
    console.log('='.repeat(60));

    try {
        // Buscar partidos del 26/11/2025
        const dateStr = '2024-11-26'; // YYYY-MM-DD

        console.log(`📅 Buscando partidos del: ${dateStr}\n`);

        const url = `https://www.sofascore.com/api/v1/sport/basketball/scheduled-events/${dateStr}`;
        const response = await axios.get(url, { headers });
        const events = response.data.events || [];

        console.log(`📊 Total eventos: ${events.length}\n`);

        // Buscar partido de Thunder (Oklahoma City) vs Timberwolves (Minnesota)
        const nbaGame = events.find(event => {
            const home = event.homeTeam?.name?.toLowerCase() || '';
            const away = event.awayTeam?.name?.toLowerCase() || '';
            return (home.includes('thunder') || away.includes('thunder')) ||
                (home.includes('warriors') || away.includes('warriors')) ||
                (home.includes('knicks') || away.includes('knicks'));
        });

        if (nbaGame) {
            const eventId = nbaGame.id;

            console.log(`✅ Partido encontrado:`);
            console.log(`   ${nbaGame.homeTeam?.name} ${nbaGame.homeScore?.current || 0} - ${nbaGame.awayScore?.current || 0} ${nbaGame.awayTeam?.name}`);
            console.log(`   Liga: ${nbaGame.tournament?.name}`);
            console.log(`   Event ID: ${eventId}\n`);

            // Obtener estadísticas
            console.log('📊 Obteniendo estadísticas detalladas...\n');
            const statsUrl = `https://www.sofascore.com/api/v1/event/${eventId}/statistics`;

            try {
                const statsResponse = await axios.get(statsUrl, { headers });

                if (statsResponse.data.statistics) {
                    console.log('✅ ¡ESTADÍSTICAS COMPLETAS DISPONIBLES!\n');

                    statsResponse.data.statistics.forEach(periodStat => {
                        if (periodStat.period === 'ALL') {
                            console.log('=== TOTALES DEL PARTIDO ===\n');

                            periodStat.groups.forEach(group => {
                                console.log(`📊 ${group.groupName}:`);
                                group.statisticsItems.forEach(item => {
                                    console.log(`   ${item.name}: ${item.home} vs ${item.away}`);
                                });
                                console.log('');
                            });
                        }
                    });

                    console.log('\n' + '='.repeat(60));
                    console.log('✅ CONFIRMADO: Podemos usar este Event ID para el frontend');
                    console.log(`   Event ID: ${eventId}`);
                    console.log('='.repeat(60));
                }
            } catch (statsError) {
                console.log(`❌ Error obteniendo estadísticas: ${statsError.response?.status || statsError.message}`);
            }
        } else {
            console.log('⚠️  No se encontró el partido específico');
            console.log('\nPartidos de NBA del día:');
            events
                .filter(e => e.tournament?.name?.toLowerCase().includes('nba'))
                .slice(0, 10)
                .forEach(e => {
                    console.log(`  - ${e.homeTeam?.name} vs ${e.awayTeam?.name} (ID: ${e.id})`);
                });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

findAndTestNBA().catch(console.error);
