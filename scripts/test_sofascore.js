const sofaScoreService = require('../src/services/football/sofaScoreService');

async function testSofaScore() {
    console.log('🔍 Probando SofaScore Service\n');

    // 1. Obtener eventos en vivo
    console.log('1️⃣ Obteniendo eventos en vivo...');
    const liveEvents = await sofaScoreService.getLiveEvents();

    if (liveEvents.success) {
        console.log(`✅ ${liveEvents.fromCache ? '[CACHE]' : '[API]'} Eventos en vivo obtenidos`);
        const events = liveEvents.data.events || [];
        console.log(`   Total eventos: ${events.length}`);

        if (events.length > 0) {
            const firstEvent = events[0];
            const eventId = firstEvent.id;
            console.log(`   Ejemplo: ${firstEvent.homeTeam?.name} vs ${firstEvent.awayTeam?.name}`);
            console.log(`   Event ID: ${eventId}\n`);

            // 2. Obtener detalles del evento
            console.log('2️⃣ Obteniendo detalles del evento...');
            const eventDetails = await sofaScoreService.getEventDetails(eventId);
            if (eventDetails.success) {
                console.log(`✅ ${eventDetails.fromCache ? '[CACHE]' : '[API]'} Detalles obtenidos`);
                console.log(`   Estado: ${eventDetails.data.event?.status?.description || 'N/A'}\n`);
            } else {
                console.log(`❌ Error: ${eventDetails.error}\n`);
            }

            // 3. Obtener estadísticas del evento
            console.log('3️⃣ Obteniendo estadísticas del partido...');
            const eventStats = await sofaScoreService.getEventStatistics(eventId);
            if (eventStats.success) {
                console.log(`✅ ${eventStats.fromCache ? '[CACHE]' : '[API]'} Estadísticas obtenidas`);
                const stats = eventStats.data.statistics || [];
                console.log(`   Grupos de estadísticas: ${stats.length}\n`);
            } else {
                console.log(`❌ Error: ${eventStats.error}\n`);
            }

            // 4. Obtener estadísticas de jugadores
            console.log('4️⃣ Obteniendo estadísticas de jugadores...');
            const playerStats = await sofaScoreService.getPlayerStatistics(eventId);
            if (playerStats.success) {
                console.log(`✅ ${playerStats.fromCache ? '[CACHE]' : '[API]'} Estadísticas de jugadores obtenidas\n`);
            } else {
                console.log(`❌ Error: ${playerStats.error}\n`);
            }

            // 5. Obtener alineaciones
            console.log('5️⃣ Obteniendo alineaciones...');
            const lineups = await sofaScoreService.getLineups(eventId);
            if (lineups.success) {
                console.log(`✅ ${lineups.fromCache ? '[CACHE]' : '[API]'} Alineaciones obtenidas\n`);
            } else {
                console.log(`❌ Error: ${lineups.error}\n`);
            }
        } else {
            console.log('⚠️  No hay eventos en vivo en este momento');
        }
    } else {
        console.log(`❌ Error obteniendo eventos: ${liveEvents.error}`);
    }

    console.log('\n✅ Prueba completada');
}

testSofaScore().catch(console.error);
