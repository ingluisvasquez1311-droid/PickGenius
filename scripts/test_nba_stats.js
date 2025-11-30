const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNBAStats() {
    console.log('🏀 Probando Estadísticas de NBA en SofaScore\n');
    console.log('='.repeat(60));

    try {
        // Obtener todos los eventos en vivo
        const response = await axios.get(`${BASE_URL}/api/sofascore/basketball/live`);
        const events = response.data.data || [];

        console.log(`📊 Total eventos en vivo: ${events.length}\n`);

        // Filtrar solo juegos que probablemente sean de NBA o ligas profesionales
        const professionalGames = events.filter(event => {
            const tournament = event.tournament?.name?.toLowerCase() || '';
            const category = event.tournament?.category?.name?.toLowerCase() || '';

            return tournament.includes('nba') ||
                category.includes('usa') && !tournament.includes('college') ||
                tournament.includes('euroleague') ||
                tournament.includes('acb');
        });

        console.log(`🏆 Juegos profesionales encontrados: ${professionalGames.length}\n`);

        if (professionalGames.length > 0) {
            const game = professionalGames[0];
            const eventId = game.id;

            console.log(`Probando: ${game.homeTeam?.name} vs ${game.awayTeam?.name}`);
            console.log(`Liga: ${game.tournament?.name}`);
            console.log(`Score: ${game.homeScore?.current || 0} - ${game.awayScore?.current || 0}\n`);

            // Obtener estadísticas
            console.log('📊 Obteniendo estadísticas...');
            const statsResponse = await axios.get(`${BASE_URL}/api/sofascore/basketball/game/${eventId}/stats`);

            if (statsResponse.data.success && statsResponse.data.data?.periods) {
                const allPeriod = statsResponse.data.data.periods.find(p => p.period === 'ALL');

                if (allPeriod) {
                    console.log('\n✅ ESTADÍSTICAS DETALLADAS DISPONIBLES:\n');

                    console.log('🎯 PUNTOS:');
                    Object.entries(allPeriod.scoring).forEach(([key, stat]) => {
                        console.log(`   ${key}: ${stat.home} vs ${stat.away}`);
                    });

                    console.log('\n🏀 REBOTES:');
                    Object.entries(allPeriod.rebounds).forEach(([key, stat]) => {
                        console.log(`   ${key}: ${stat.home} vs ${stat.away}`);
                    });

                    console.log('\n📈 OTROS:');
                    Object.entries(allPeriod.other).forEach(([key, stat]) => {
                        console.log(`   ${key}: ${stat.home || stat.homeValue} vs ${stat.away || stat.awayValue}`);
                    });
                }
            }
        } else {
            console.log('⚠️  No hay juegos profesionales en vivo en este momento');
            console.log('\nJuegos universitarios/menores encontrados:');
            events.slice(0, 5).forEach(event => {
                console.log(`  - ${event.homeTeam?.name} vs ${event.awayTeam?.name} (${event.tournament?.name})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(60));
}

testNBAStats().catch(console.error);
