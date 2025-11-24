const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { db } = require('../config/firebase');

class SyncService {
    constructor() {
        this.apiKey = config.apis.nba_key || process.env.NBA_API_KEY;
        this.baseUrl = config.apis.nba;
        this.dataPath = path.join(__dirname, '../../data/nba');

        // Ensure data directory exists
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }

    async syncSeasonStats(season = 2025) {
        try {
            console.log(`🔄 Syncing NBA ${season} season stats...`);

            // Fetch stats from NBA API
            const stats = await this.fetchSeasonStats(season);

            if (stats.length === 0) {
                console.warn(`⚠️ No stats found for ${season} season`);
                return { success: false, message: 'No data found' };
            }

            // Save to CSV
            const csvPath = await this.saveToCSV(stats, `season_${season}_stats`);
            console.log(`✅ Saved to CSV: ${csvPath}`);

            // Save to Firebase
            await this.saveToFirebase(stats, `nba_season_${season}_stats`);
            console.log(`✅ Saved to Firebase`);

            return {
                success: true,
                recordsCount: stats.length,
                csvPath: csvPath,
                season: season
            };
        } catch (error) {
            console.error('Error syncing season stats:', error.message);
            throw error;
        }
    }

    async fetchSeasonStats(season) {
        try {
            const stats = [];

            // Get all games for the season
            const startDate = `${season}-10-01`; // NBA season typically starts in October
            const endDate = `${season}-06-30`;   // Ends in June

            console.log(`📅 Fetching games from ${startDate} to ${endDate}...`);

            const response = await axios.get(`${this.baseUrl}/games`, {
                headers: { 'Authorization': this.apiKey },
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    per_page: 100
                }
            });

            const games = response.data.data || [];
            console.log(`📊 Found ${games.length} games`);

            // Transform games into stats format
            for (const game of games) {
                stats.push({
                    game_id: game.id,
                    date: game.date,
                    season: season,
                    home_team: game.home_team?.full_name,
                    home_team_abbr: game.home_team?.abbreviation,
                    away_team: game.visitor_team?.full_name,
                    away_team_abbr: game.visitor_team?.abbreviation,
                    home_score: game.home_team_score,
                    away_score: game.visitor_team_score,
                    status: game.status,
                    period: game.period
                });
            }

            return stats;
        } catch (error) {
            console.error('Error fetching season stats:', error.message);
            return [];
        }
    }

    async saveToCSV(data, filename) {
        try {
            const csvPath = path.join(this.dataPath, `${filename}.csv`);

            // Get headers from first record
            const headers = Object.keys(data[0]).map(key => ({
                id: key,
                title: key.toUpperCase()
            }));

            const csvWriter = createCsvWriter({
                path: csvPath,
                header: headers
            });

            await csvWriter.writeRecords(data);
            return csvPath;
        } catch (error) {
            console.error('Error saving to CSV:', error.message);
            throw error;
        }
    }

    async saveToFirebase(data, collection) {
        try {
            if (!db) {
                console.warn('Firestore not initialized');
                return;
            }

            const BATCH_SIZE = 500;
            let totalSaved = 0;

            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                const chunk = data.slice(i, i + BATCH_SIZE);
                const batch = db.batch();

                chunk.forEach((item, index) => {
                    const docRef = db.collection(collection).doc(`game_${item.game_id || i + index}`);
                    batch.set(docRef, item);
                });

                await batch.commit();
                totalSaved += chunk.length;
                console.log(`  📦 Saved batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} items`);
            }

            console.log(`✅ Total saved to ${collection}: ${totalSaved} items`);
        } catch (error) {
            console.error('Error saving to Firebase:', error.message);
        }
    }
}

module.exports = new SyncService();
