const sofaScoreBasketballService = require('../src/services/basketball/sofaScoreBasketballService');

async function testBasketballStats() {
    console.log('🏀 Probando Estadísticas Detalladas de Baloncesto\n');

    // 1. Obtener eventos en vivo
    console.log('1️⃣ Obteniendo eventos en vivo...');
    const liveEvents = await sofaScoreBasketballService.getLiveEvents();

    if (liveEvents.success && liveEvents.data.events && liveEvents.data.events.length > 0) {
        const firstEvent = liveEvents.data.events[0];
        const eventId = firstEvent.id;

        console.log(`✅ Evento: ${firstEvent.homeTeam?.name} vs ${firstEvent.awayTeam?.name}`);
        console.log(`   Score: ${firstEvent.homeScore?.current || 0} - ${firstEvent.awayScore?.current || 0}`);
        console.log(`   Event ID: ${eventId}\n`);

        // 2. Obtener estadísticas formateadas
        console.log('2️⃣ Obteniendo estadísticas detalladas...');
        const stats = await sofaScoreBasketballService.getFormattedGameStats(eventId);

        if (stats.success && stats.data.periods.length > 0) {
            const allPeriods = stats.data.periods.find(p => p.period === 'ALL');

            if (allPeriods) {
                console.log('📊 ESTADÍSTICAS DEL PARTIDO (Totales)\n');

                // PUNTOS
                console.log('🎯 PUNTOS:');
                if (allPeriods.scoring['Free throws']) {
                    const ft = allPeriods.scoring['Free throws'];
                    console.log(`   Tiros Libres:     ${ft.home} vs ${ft.away}`);
                }
                if (allPeriods.scoring['2 pointers']) {
                    const tp = allPeriods.scoring['2 pointers'];
                    console.log(`   2 Puntos:         ${tp.home} vs ${tp.away}`);
                }
                if (allPeriods.scoring['3 pointers']) {
                    const thp = allPeriods.scoring['3 pointers'];
                    console.log(`   3 Puntos:         ${thp.home} vs ${thp.away}`);
                }
                if (allPeriods.scoring['Field goals']) {
                    const fg = allPeriods.scoring['Field goals'];
                    console.log(`   Tiros de Campo:   ${fg.home} vs ${fg.away}`);
                }

                // REBOTES
                console.log('\n🏀 REBOTES:');
                if (allPeriods.rebounds['Total']) {
                    const total = allPeriods.rebounds['Total'];
                    console.log(`   Total:            ${total.home} vs ${total.away}`);
                }
                if (allPeriods.rebounds['Defensive']) {
                    const def = allPeriods.rebounds['Defensive'];
                    console.log(`   Defensivos:       ${def.home} vs ${def.away}`);
                }
                if (allPeriods.rebounds['Offensive']) {
                    const off = allPeriods.rebounds['Offensive'];
                    console.log(`   Ofensivos:        ${off.home} vs ${off.away}`);
                }

                // OTROS
                console.log('\n📈 OTROS:');
                if (allPeriods.other['Assists']) {
                    const ast = allPeriods.other['Assists'];
                    console.log(`   Asistencias:      ${ast.homeValue} vs ${ast.awayValue}`);
                }
                if (allPeriods.other['Turnovers']) {
                    const to = allPeriods.other['Turnovers'];
                    console.log(`   Pérdidas:         ${to.homeValue} vs ${to.awayValue}`);
                }
                if (allPeriods.other['Steals']) {
                    const stl = allPeriods.other['Steals'];
                    console.log(`   Robos:            ${stl.homeValue} vs ${stl.awayValue}`);
                }
                if (allPeriods.other['Blocks']) {
                    const blk = allPeriods.other['Blocks'];
                    console.log(`   Bloqueos:         ${blk.homeValue} vs ${blk.awayValue}`);
                }
                if (allPeriods.other['Personal fouls']) {
                    const pf = allPeriods.other['Personal fouls'];
                    console.log(`   Faltas:           ${pf.homeValue} vs ${pf.awayValue}`);
                }

                console.log('\n' + '='.repeat(50));
                console.log('✅ Estas son las estadísticas que podemos mostrar en la UI!');
                console.log('='.repeat(50));
            }
        }
    } else {
        console.log('⚠️  No hay eventos en vivo en este momento');
    }
}

testBasketballStats().catch(console.error);
