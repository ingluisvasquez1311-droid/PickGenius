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

async function findNBAGames() {
    console.log('🏀 Buscando partidos de NBA en SofaScore\n');
    console.log('='.repeat(60));

    try {
        // Calcular fecha de ayer
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`📅 Probando con fecha: ${dateStr}\n`);

        // Endpoint de eventos de baloncesto por fecha
        const url = `https://www.sofascore.com/api/v1/sport/basketball/scheduled-events/${dateStr}`;
        console.log(`🌐 Consultando: ${url}\n`);

        const response = await axios.get(url, { headers });
        const events = response.data.events || [];

        console.log(`📊 Total eventos de baloncesto: ${events.length}\n`);

        // Filtrar solo NBA
        const nbaGames = events.filter(event => {
            const tournament = event.tournament?.name?.toLowerCase() || '';
            const uniqueTournament = event.tournament?.uniqueTournament?.name?.toLowerCase() || '';
            return tournament.includes('nba') || uniqueTournament.includes('nba');
        });

        console.log(`🏆 Partidos de NBA encontrados: ${nbaGames.length}\n`);

        if (nbaGames.length > 0) {
            const game = nbaGames[0];
            const eventId = game.id;

            console.log(`Partido de prueba:`);
            console.log(`  ${game.homeTeam?.name} ${game.homeScore?.current || 0} - ${game.awayScore?.current || 0} ${game.awayTeam?.name}`);
            console.log(`  Status: ${game.status?.description || game.status?.type}`);
            console.log(`  Event ID: ${eventId}\n`);

            // Probar estadísticas
            console.log('📊 Obteniendo estadísticas...\n');
            const statsUrl = `https://www.sofascore.com/api/v1/event/${eventId}/statistics`;

            try {
                const statsResponse = await axios.get(statsUrl, { headers });

                if (statsResponse.data.statistics) {
                    console.log('✅ ¡ESTADÍSTICAS DISPONIBLES!\n');

                    statsResponse.data.statistics.forEach(periodStat => {
                        if (periodStat.period === 'ALL') {
                            console.log('=== ESTADÍSTICAS TOTALES ===\n');

                            periodStat.groups.forEach(group => {
                                console.log(`${group.groupName}:`);
                                group.statisticsItems.forEach(item => {
                                    console.log(`  ${item.name}: ${item.home} vs ${item.away}`);
                                });
                                console.log('');
                            });
                        }
                    });

                    console.log('\n✅ Event ID para usar en el frontend: ' + eventId);
                }
            } catch (statsError) {
                console.log(`⚠️  No hay estadísticas disponibles para este partido (${statsError.response?.status || statsError.message})`);
                console.log('   El partido puede estar programado pero no jugado aún');
            }
        } else {
            console.log('⚠️  No se encontraron partidos de NBA en esa fecha');
            console.log('\n💡 Alternativa: Usar un Event ID conocido de NBA');
            console.log('   Por ejemplo, podemos usar datos de fútbol que SÍ funcionan');
            console.log('   o esperar a que haya partidos de NBA en vivo esta noche');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📌 RESUMEN:');
    console.log('   - Fútbol: ✅ Estadísticas funcionando perfectamente');
    console.log('   - NBA: ⏳ Requiere partidos en vivo o finalizados recientes');
    console.log('   - Recomendación: Usar datos de fútbol para desarrollar el frontend');
}

findNBAGames().catch(console.error);
