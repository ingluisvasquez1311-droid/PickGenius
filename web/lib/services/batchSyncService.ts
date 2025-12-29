import { getFirestore } from '@/lib/firebaseAdmin';
import { sportsDataService } from './sportsDataService';
import { oddsSyncService } from './oddsSyncService';
import { groqService } from './groqService';
import { PromptBuilder } from '@/lib/utils/promptBuilder';
import { firebaseReadService } from '@/lib/FirebaseReadService';
import * as admin from 'firebase-admin';

const SPORTS_CONFIG: Record<string, { sofascoreId: number }> = {
    football: { sofascoreId: 1 },
    basketball: { sofascoreId: 2 },
    tennis: { sofascoreId: 5 },
    baseball: { sofascoreId: 3 },
    'ice-hockey': { sofascoreId: 4 },
    'american-football': { sofascoreId: 16 }
};

export class BatchSyncService {
    private db = getFirestore();

    async syncSport(sport: string) {
        console.log(`\n🔄 [BatchSync] Starting DECOUPLED sync for ${sport.toUpperCase()}...`);
        const startTime = Date.now();

        try {
            // PHASE 1: RAW DATA FETCHING & STORAGE (No AI)
            const rawGames = await this.fetchAndStoreRawMatches(sport);

            if (rawGames.length === 0) {
                console.log(`⚠️ [BatchSync] No games found for ${sport} (Phase 1 empty)`);
                return { sport, gamesFound: 0, gamesSaved: 0 };
            }

            // PHASE 2: GENIUS ENGINE (ROBOT - Reads strictly from Firebase)
            const savedCount = await this.runGeniusEngine(sport, rawGames);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ [BatchSync] Completed ${sport} in ${duration}s. Processed ${savedCount} predictions.`);

            return { sport, gamesFound: rawGames.length, gamesSaved: savedCount, duration };

        } catch (error) {
            console.error(`❌ [BatchSync] Error in decoupled sync for ${sport}:`, error);
            throw error;
        }
    }

    /**
     * PHASE 1: Fetch from APIs and dump to Firestore
     */
    private async fetchAndStoreRawMatches(sport: string): Promise<any[]> {
        const now = new Date();
        const formatLocal = (d: Date) => d.toISOString().split('T')[0];
        const today = formatLocal(now);

        const tmr = new Date(now);
        tmr.setDate(tmr.getDate() + 1);
        const tomorrow = formatLocal(tmr);

        console.log(`📡 [RawSync] Fetching ${sport} from APIs (${today} & ${tomorrow})`);

        const [todayGames, tomorrowGames] = await Promise.all([
            sportsDataService.getEventsBySport(sport, today).catch(() => []),
            sportsDataService.getEventsBySport(sport, tomorrow).catch(() => [])
        ]);

        const allGames = [...todayGames, ...tomorrowGames];
        if (allGames.length === 0) return [];

        console.log(`📦 [RawSync] Storing ${allGames.length} raw matches and syncing odds/stats to Firebase...`);

        // Batch processing for Raw Data - Reduced for stability
        const BATCH_SIZE = 5;
        for (let i = 0; i < allGames.length; i += BATCH_SIZE) {
            const batch = allGames.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (game) => {
                try {
                    // 1. Sync Odds to marketLines
                    await oddsSyncService.syncEventOdds(game.id, sport);

                    // 2. Fetch and Store H2H/Stats to matchStats
                    const h2hRes = await sportsDataService.getMatchH2H(Number(game.id)).catch(() => null);
                    if (h2hRes) {
                        await this.db.collection('matchStats').doc(game.id.toString()).set({
                            ...h2hRes,
                            syncedAt: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }

                    // 3. Save Basic Game Info
                    const gameRef = this.db.collection('games').doc(`${sport}_${game.id}`);
                    await gameRef.set({
                        id: game.id.toString(),
                        sport,
                        status: game.status?.type || 'scheduled',
                        startTime: game.startTimestamp ? admin.firestore.Timestamp.fromMillis(game.startTimestamp * 1000) : null,
                        homeTeam: { id: game.homeTeam?.id, name: game.homeTeam?.name, score: game.homeScore?.current },
                        awayTeam: { id: game.awayTeam?.id, name: game.awayTeam?.name, score: game.awayScore?.current },
                        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
                    }, { merge: true });

                } catch (e) {
                    console.error(`❌ [RawSync] Error storing raw game ${game.id}:`, e);
                }
            }));

            // Artificial delay between batches to respect rate limits
            if (i + BATCH_SIZE < allGames.length) {
                console.log(`⏳ [RawSync] Waiting 500ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return allGames;
    }

    /**
     * PHASE 2: The Robot reads from Firebase and enriches games with AI analysis
     */
    private async runGeniusEngine(sport: string, rawGames: any[]): Promise<number> {
        console.log(`🧠 [GeniusEngine] Analyzing ${rawGames.length} games using ONLY Firestore context...`);
        let savedCount = 0;

        // Engine batch size (AI concurrency) - Reduced to avoid token limits
        const ENGINE_BATCH = 2;
        for (let i = 0; i < rawGames.length; i += ENGINE_BATCH) {
            const batch = rawGames.slice(i, i + ENGINE_BATCH);

            await Promise.all(batch.map(async (gameData) => {
                try {
                    const gameId = gameData.id.toString();

                    // 🛡️ NO API CALLS HERE - Strictly Firestore
                    const [storedOdds, storedStats] = await Promise.all([
                        firebaseReadService.getMarketLine(gameId, sport),
                        firebaseReadService.getMatchStats(gameId)
                    ]);

                    if (!storedOdds) return;

                    const matchContext = {
                        id: gameId,
                        sport: sport,
                        home: gameData.homeTeam?.name,
                        away: gameData.awayTeam?.name,
                        score: `${gameData.homeScore?.current ?? 0} - ${gameData.awayScore?.current ?? 0}`,
                        status: gameData.status?.description,
                        h2hHistory: (storedStats as any)?.events?.slice(0, 5) || [],
                        marketOdds: [{ marketName: storedOdds.marketName, choices: [{ name: 'Over/Under', fraction: storedOdds.odds?.over }] }]
                    };

                    const prompt = PromptBuilder.build(sport, matchContext, storedOdds);

                    const aiPrediction = await groqService.createPrediction({
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' }
                    });

                    if (aiPrediction) {
                        const gameRef = this.db.collection('games').doc(`${sport}_${gameId}`);
                        await gameRef.set({
                            aiAnalysis: aiPrediction,
                            predictions: {
                                provider: 'Betplay Colombia',
                                overUnder: {
                                    line: storedOdds.line,
                                    marketName: storedOdds.marketName,
                                    odds: storedOdds.odds
                                },
                                spread: storedOdds.handicap ? { line: storedOdds.handicap } : null,
                                lastUpdate: storedOdds.updatedAt
                            },
                            analyzedAt: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                        savedCount++;
                    }

                } catch (engineErr: any) {
                    console.error(`⚠️ [GeniusEngine] Analysis failed for ${gameData.id}:`, engineErr.message);
                }
            }));
        }

        return savedCount;
    }

    async cleanOldData() {
        console.log('🗑️ [BatchSync] Cleaning old data...');
        const now = new Date();
        const gamesRef = this.db.collection('games');
        const snapshot = await gamesRef.where('expiresAt', '<', admin.firestore.Timestamp.fromDate(now)).get();

        if (snapshot.empty) return 0;

        const batch = this.db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`✅ [BatchSync] Deleted ${snapshot.size} expired games`);
        return snapshot.size;
    }

    async syncAll() {
        const results = [];
        console.log('🚀 [BatchSync] Starting Global Sync (Firebase-First Architecture)...');

        try {
            const { verifyFirebaseConnection } = await import('@/lib/firebaseAdmin');
            const isConnected = await verifyFirebaseConnection();
            if (!isConnected) {
                throw new Error('Firebase Admin NOT initialized. Please check your credentials.');
            }
        } catch (e) {
            console.error('❌ [BatchSync] Firebase Connection Failed:', e);
            throw e;
        }

        groqService.reset();
        await this.cleanOldData();

        for (const sport of Object.keys(SPORTS_CONFIG)) {
            const result = await this.syncSport(sport);
            results.push(result);
        }
        return results;
    }
}

export const batchSyncService = new BatchSyncService();
