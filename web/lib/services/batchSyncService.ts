import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { sportsDataService } from './sportsDataService';
import { oddsSyncService } from './oddsSyncService';
import { APIRotator } from './apiRotator';

// Initialize Rotators
const sofascoreRotator = new APIRotator('SOFASCORE_API_KEYS', 'Sofascore');
// Betplay uses our internal bridge, but we can simulate rotation if we had multiple proxies/keys
// const bplayRotator = new APIRotator('BPLAY_API_KEYS', 'Betplay');

const SPORTS_CONFIG: Record<string, { sofascoreId: number }> = {
    football: { sofascoreId: 1 },
    basketball: { sofascoreId: 2 },
    tennis: { sofascoreId: 5 },
    baseball: { sofascoreId: 3 },
    'ice-hockey': { sofascoreId: 4 },
    'american-football': { sofascoreId: 16 }
};

export class BatchSyncService {

    /**
     * Main entry point to sync a specific sport
     */
    async syncSport(sport: string) {
        console.log(`\n🔄 [BatchSync] Starting sync for ${sport.toUpperCase()}...`);
        const startTime = Date.now();

        try {
            // 1. FETCH: Get Schedule + Live from Sofascore
            // We use our existing service which handles the proxy/logic
            // TODO: If moving to Direct RapidAPI with keys, update sportsDataService to use sofascoreRotator.getNextKey()
            const allGames = await sportsDataService.getEventsBySport(sport, new Date().toISOString().split('T')[0]);

            if (allGames.length === 0) {
                console.log(`⚠️ [BatchSync] No games found for ${sport}`);
                return { sport, gamesFound: 0, gamesSaved: 0 };
            }

            console.log(`📊 [BatchSync] Found ${allGames.length} games for ${sport}`);

            // 2. ENRICH & TRANSFORM: Add Odds/Predictions
            // Process in batches to avoid overwhelming the bridge/firebase
            const BATCH_SIZE = 10;
            let savedCount = 0;
            const enrichedGames: any[] = [];

            for (let i = 0; i < allGames.length; i += BATCH_SIZE) {
                const batchGames = allGames.slice(i, i + BATCH_SIZE);

                const batchPromises = batchGames.map(async (game) => {
                    try {
                        // Enrich with Betplay Odds
                        // This "MarketLine" is our "BPlay Prediction" source of truth for odds
                        let marketLine = await oddsSyncService.syncEventOdds(game.id, sport);

                        // Construct the "Enriched Game" Object for Firebase
                        const enrichedGame = {
                            id: game.id.toString(),
                            sport: sport,
                            status: game.status?.type || 'scheduled',
                            startTime: game.startTimestamp ? new Date(game.startTimestamp * 1000).toISOString() : null,
                            homeTeam: {
                                id: game.homeTeam?.id,
                                name: game.homeTeam?.name,
                                logo: `https://api.sofascore.app/api/v1/team/${game.homeTeam?.id}/image`, // Direct or via proxy
                                score: game.homeScore?.current ?? null
                            },
                            awayTeam: {
                                id: game.awayTeam?.id,
                                name: game.awayTeam?.name,
                                logo: `https://api.sofascore.app/api/v1/team/${game.awayTeam?.id}/image`,
                                score: game.awayScore?.current ?? null
                            },
                            // The "Predictions" block populated by Betplay Odds
                            predictions: marketLine ? {
                                provider: 'Betplay Colombia',
                                overUnder: {
                                    line: marketLine.line,
                                    marketName: marketLine.marketName,
                                    odds: marketLine.odds
                                },
                                spread: marketLine.handicap ? { line: marketLine.handicap } : null,
                                lastUpdate: marketLine.updatedAt
                            } : null,

                            syncedAt: Timestamp.now(),
                            expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24h TTL
                        };

                        return enrichedGame;
                    } catch (e) {
                        console.error(`Error enriching game ${game.id}:`, e);
                        return null;
                    }
                });

                const processedBatch = (await Promise.all(batchPromises)).filter(g => g !== null);
                enrichedGames.push(...processedBatch);

                // 3. LOAD: Save to Firebase
                if (processedBatch.length > 0) {
                    await this.saveBatchToFirebase(processedBatch);
                    savedCount += processedBatch.length;
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ [BatchSync] Completed ${sport} in ${duration}s. Saved ${savedCount} games.`);

            return {
                sport,
                gamesFound: allGames.length,
                gamesSaved: savedCount,
                duration
            };

        } catch (error) {
            console.error(`❌ [BatchSync] Error syncing ${sport}:`, error);
            throw error;
        }
    }

    private async saveBatchToFirebase(games: any[]) {
        if (!db) return;
        const batch = writeBatch(db);
        const collectionRef = collection(db, 'games');

        games.forEach(game => {
            const docRef = doc(collectionRef, `${game.sport}_${game.id}`);
            batch.set(docRef, game, { merge: true });
        });

        await batch.commit();
    }

    async cleanOldData() {
        if (!db) return 0;
        console.log('🗑️ [BatchSync] Cleaning old data...');

        const now = Timestamp.now();
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('expiresAt', '<', now));

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('✅ [BatchSync] No old data to clean');
            return 0;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        console.log(`✅ [BatchSync] Deleted ${snapshot.size} expired games`);
        return snapshot.size;
    }

    async syncAll() {
        const results = [];
        await this.cleanOldData();

        for (const sport of Object.keys(SPORTS_CONFIG)) {
            const result = await this.syncSport(sport);
            results.push(result);
        }
        return results;
    }
}

export const batchSyncService = new BatchSyncService();
