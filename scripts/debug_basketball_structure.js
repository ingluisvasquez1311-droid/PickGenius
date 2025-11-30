const sofaScoreBasketballService = require('../src/services/basketball/sofaScoreBasketballService');

async function debugStats() {
    console.log('🔍 Debug: Explorando estructura de estadísticas\n');

    const liveEvents = await sofaScoreBasketballService.getLiveEvents();

    if (liveEvents.success && liveEvents.data.events && liveEvents.data.events.length > 0) {
        const eventId = liveEvents.data.events[0].id;

        const response = await sofaScoreBasketballService.getEventStatistics(eventId);

        if (response.success && response.data.statistics) {
            console.log('📊 Estructura completa de estadísticas:\n');

            response.data.statistics.forEach(periodStat => {
                console.log(`\n=== Periodo: ${periodStat.period} ===`);

                periodStat.groups.forEach(group => {
                    console.log(`\n  Grupo: ${group.groupName}`);

                    group.statisticsItems.forEach(item => {
                        console.log(`    - ${item.name}: ${item.home} vs ${item.away}`);
                    });
                });
            });
        }
    }
}

debugStats().catch(console.error);
