import axios from 'axios';
import { adminDb } from '@/lib/firebase-admin';

interface NBAGame {
    id: number;
    date: string;
    season: number;
    status: string;
    period: number;
    time: string;
    postseason: boolean;
    home_team_score: number;
    visitor_team_score: number;
    home_team: {
        id: number;
        abbreviation: string;
        city: string;
        conference: string;
        division: string;
        full_name: string;
        name: string;
    };
    visitor_team: {
        id: number;
        abbreviation: string;
        city: string;
        conference: string;
        division: string;
        full_name: string;
        name: string;
    };
}

class NBASyncService {
    private apiKey: string;
    private baseUrl = 'https://api.balldontlie.io/v1';
    private currentSeason = '2024-25';

    constructor() {
        this.apiKey = process.env.NBA_API_KEY || '';
    }

    async syncCurrentSeason() {
        if (!this.apiKey) {
            console.error('❌ [NBA Sync] Missing NBA_API_KEY (balldontlie)');
            return { success: false, error: 'Missing API Key' };
        }

        if (!adminDb) {
            console.error('❌ [NBA Sync] Firebase Admin not initialized');
            return { success: false, error: 'Firebase Admin not initialized' };
        }

        try {
            console.log(`🔄 [NBA Sync] Syncing ${this.currentSeason} games...`);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7); // Last 7 days

            const games = await this.fetchRecentGames(startDate, endDate);

            if (games.length === 0) {
                return { success: true, gamesProcessed: 0 };
            }

            await this.saveGamesToFirebase(games);

            return {
                success: true,
                gamesProcessed: games.length,
                season: this.currentSeason
            };
        } catch (error: any) {
            console.error('❌ [NBA Sync] Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    private async fetchRecentGames(startDate: Date, endDate: Date): Promise<NBAGame[]> {
        const games: NBAGame[] = [];
        let page = 1;
        let hasMore = true;

        try {
            while (hasMore && page <= 5) {
                const response = await axios.get(`${this.baseUrl}/games`, {
                    headers: { 'Authorization': this.apiKey },
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0],
                        per_page: 100,
                        page: page
                    }
                });

                const data = response.data.data || [];
                games.push(...data);
                hasMore = data.length === 100;
                page++;
            }
            return games;
        } catch (error: any) {
            console.error('❌ [NBA Sync] Fetch Error:', error.message);
            return [];
        }
    }

    private async saveGamesToFirebase(games: NBAGame[]) {
        if (!adminDb) return;

        const BATCH_SIZE = 400;
        for (let i = 0; i < games.length; i += BATCH_SIZE) {
            const chunk = games.slice(i, i + BATCH_SIZE);
            const batch = adminDb.batch();

            chunk.forEach((game) => {
                const docRef = adminDb.collection('nba_games').doc(game.id.toString());
                batch.set(docRef, {
                    ...game,
                    season_year: this.currentSeason,
                    syncedAt: new Date().toISOString()
                }, { merge: true });
            });

            await batch.commit();

            // Sync stats for finished games in this chunk
            for (const game of chunk) {
                if (game.status === 'Final' || game.status.includes('Final')) {
                    await this.syncGameStats(game);
                }
            }
        }
    }

    private async syncGameStats(game: NBAGame) {
        if (!adminDb) return;

        try {
            const response = await axios.get(`${this.baseUrl}/stats`, {
                headers: { 'Authorization': this.apiKey },
                params: {
                    game_ids: [game.id],
                    per_page: 100
                }
            });

            const stats = response.data.data;
            if (!stats || stats.length === 0) return;

            const batch = adminDb.batch();

            stats.forEach((stat: any) => {
                const statId = `${game.id}_${stat.player.id}`;
                const docRef = adminDb.collection('nba_regular_season_box_scores_2024_25').doc(statId);

                const formattedStat = {
                    gameId: game.id.toString(),
                    teamTricode: stat.team.abbreviation,
                    personName: `${stat.player.first_name} ${stat.player.last_name}`,
                    points: stat.pts,
                    reboundsTotal: stat.reb,
                    assists: stat.ast,
                    fieldGoalsPercentage: stat.fg_pct ? (stat.fg_pct * 100).toFixed(1) : '0.0',
                    threePointersMade: stat.fg3m,
                    minutes: stat.min,
                    season_year: this.currentSeason,
                    game_date: game.date.split('T')[0]
                };

                batch.set(docRef, formattedStat, { merge: true });
            });

            await batch.commit();
            // Sleep to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
            console.error(`❌ [NBA Sync] Stats Error (Game ${game.id}):`, error.message);
        }
    }
}

export const nbaSyncService = new NBASyncService();
