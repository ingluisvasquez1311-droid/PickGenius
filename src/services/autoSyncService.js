const axios = require('axios');
const { db } = require('../config/firebase');
const config = require('../config/env');

class AutoSyncService {
    constructor() {
        this.apiKey = config.apis.nba_key || process.env.NBA_API_KEY;
        this.baseUrl = 'https://api.balldontlie.io/v1';
        this.currentSeason = '2024-25'; // Temporada actual
    }

    // Auto-sync que se ejecuta diariamente
    async syncCurrentSeason() {
        try {
            console.log(`🔄 Auto-syncing ${this.currentSeason} season data...`);

            // Obtener partidos recientes (últimos 7 días)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            const games = await this.fetchRecentGames(startDate, endDate);

            if (games.length === 0) {
                console.log('⚠️ No new games found');
                return { success: true, gamesProcessed: 0 };
            }

            // Guardar en Firebase
            await this.saveGamesToFirebase(games);

            console.log(`✅ Auto-sync completed: ${games.length} games processed`);

            return {
                success: true,
                gamesProcessed: games.length,
                season: this.currentSeason,
                dateRange: {
                    from: startDate.toISOString().split('T')[0],
                    to: endDate.toISOString().split('T')[0]
                }
            };
        } catch (error) {
            console.error('❌ Auto-sync error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async fetchRecentGames(startDate, endDate) {
        try {
            const games = [];
            let page = 1;
            let hasMore = true;

            while (hasMore && page <= 5) { // Límite de 5 páginas
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

                // Verificar si hay más páginas
                hasMore = data.length === 100;
                page++;
            }

            console.log(`📊 Fetched ${games.length} games from API`);
            return games;
        } catch (error) {
            console.error('Error fetching games:', error.message);
            return [];
        }
    }

    async saveGamesToFirebase(games) {
        try {
            if (!db) {
                console.warn('Firestore not initialized');
                return;
            }

            const BATCH_SIZE = 500;
            let totalSaved = 0;

            for (let i = 0; i < games.length; i += BATCH_SIZE) {
                const chunk = games.slice(i, i + BATCH_SIZE);
                const batch = db.batch();

                // 1. Save Games
                chunk.forEach((game) => {
                    const docRef = db.collection('nba_games').doc(game.id.toString());
                    batch.set(docRef, {
                        ...game,
                        season_year: this.currentSeason,
                        syncedAt: new Date().toISOString()
                    }, { merge: true });
                });

                await batch.commit();
                totalSaved += chunk.length;
                console.log(`  📦 Saved batch: ${chunk.length} games`);

                // 2. Fetch and Save Player Stats for these games
                // We do this sequentially to avoid rate limits
                for (const game of chunk) {
                    if (game.status === 'Final') {
                        await this.syncGameStats(game);
                    }
                }
            }

            console.log(`✅ Total saved: ${totalSaved} games`);
        } catch (error) {
            console.error('Error saving games to Firebase:', error.message);
        }
    }

    async syncGameStats(game) {
        try {
            // Fetch stats for this game
            const response = await axios.get(`${this.baseUrl}/stats`, {
                headers: { 'Authorization': this.apiKey },
                params: {
                    game_ids: [game.id],
                    per_page: 100
                }
            });

            const stats = response.data.data;
            if (!stats || stats.length === 0) return;

            const batch = db.batch();


            stats.forEach(stat => {
                // Create a unique ID for the stat: gameId_playerId
                const statId = `${game.id}_${stat.player.id}`;
                const docRef = db.collection('nba_regular_season_box_scores_2024_25').doc(statId);

                // Format to match historical CSV structure
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
            console.log(`    📊 Saved stats for game ${game.id} (${stats.length} players)`);

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Error syncing stats for game ${game.id}:`, error.message);
        }
    }

    // Programar ejecución diaria
    startDailySync() {
        // Ejecutar inmediatamente
        this.syncCurrentSeason();

        // Ejecutar cada 24 horas
        setInterval(() => {
            this.syncCurrentSeason();
        }, 24 * 60 * 60 * 1000); // 24 horas en milisegundos

        console.log('🕐 Daily auto-sync scheduled');
    }
}

module.exports = new AutoSyncService();
