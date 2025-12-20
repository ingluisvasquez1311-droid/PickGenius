// src/scripts/debugSofaIds.js
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');

async function debug() {
    const testPlayers = [
        { name: 'Shohei Ohtani', id: 832962, sport: 'baseball' },
        { name: 'Connor McDavid', id: 792817, sport: 'nhl' },
        { name: 'Novak Djokovic', id: 14882, sport: 'tennis' }
    ];

    for (const p of testPlayers) {
        console.log(`\n🔍 Checking ${p.name} (${p.id})...`);
        const events = await generalizedSofaScoreService.getPlayerLastEvents(p.id);
        if (events.success && events.data.events) {
            console.log(`✅ Found ${events.data.events.length} events.`);
            const firstEvent = events.data.events[0];
            console.log(`📅 First event: ${firstEvent.name} (ID: ${firstEvent.id})`);

            const lineups = await generalizedSofaScoreService.getEventLineups(firstEvent.id);
            if (lineups.success) {
                console.log(`✅ Lineups/Stats found for event.`);
            } else {
                console.log(`❌ Lineups failed: ${lineups.error}`);
            }
        } else {
            console.log(`❌ Events failed: ${events.error}`);
        }
    }
}

debug();
