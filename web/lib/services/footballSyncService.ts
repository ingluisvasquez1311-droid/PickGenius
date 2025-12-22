import { sportsDataService } from './sportsDataService';
import { adminDb } from '../firebase-admin';

class FootballSyncService {
    // Priority Leagues (IDs from Sofascore)
    private LEAGUES = [
        { id: '17', name: 'Premier League' },
        { id: '8', name: 'LaLiga' },
        { id: '23', name: 'Serie A' },
        { id: '35', name: 'Bundesliga' },
        { id: '34', name: 'Ligue 1' }
    ];

    async syncDailyFixtures() {
        if (!adminDb) return { success: false, error: 'Firebase Admin not initialized' };

        try {
            const today = new Date().toISOString().split('T')[0];
            console.log(`⚽ [Football Sync] Fetching fixtures for ${today} from Sofascore...`);

            // Use our robust sportsDataService (uses ScraperAPI/Bypass)
            // Endpoint for all scheduled events on a date
            const data = await sportsDataService.makeRequest(`/sport/football/scheduled-events/${today}`);

            if (!data || !data.events) {
                throw new Error('No events found in Sofascore response');
            }

            const events = data.events;
            console.log(`📊 Found ${events.length} total football events. Filtering priority...`);

            // Filter for priority leagues to keep DB clean and fast
            const priorityEvents = events.filter((event: any) =>
                this.LEAGUES.some(l => event.tournament?.uniqueTournament?.id?.toString() === l.id)
            );

            await this.saveEventsToFirebase(priorityEvents);

            return {
                success: true,
                totalProcessed: priorityEvents.length,
                date: today
            };
        } catch (error: any) {
            console.error('❌ [Football Sync] Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    private async saveEventsToFirebase(events: any[]) {
        if (!adminDb) return;

        const BATCH_SIZE = 400;
        for (let i = 0; i < events.length; i += BATCH_SIZE) {
            const chunk = events.slice(i, i + BATCH_SIZE);
            const batch = adminDb.batch();

            chunk.forEach((event) => {
                const docRef = adminDb.collection('football_fixtures').doc(event.id.toString());
                batch.set(docRef, {
                    ...event,
                    syncedAt: new Date().toISOString(),
                    source: 'sofascore'
                }, { merge: true });
            });

            await batch.commit();
            console.log(`📦 Saved batch of ${chunk.length} football matches`);
        }
    }
}

export const footballSyncService = new FootballSyncService();
