const axios = require('axios');
const config = require('../config/env');
const { db } = require('../config/firebase');

class NBAService {
    constructor() {
        this.apiKey = config.apis.nba_key || process.env.NBA_API_KEY;
        this.baseUrl = config.apis.nba;

        // Debug API Key (masked)
        const keyPreview = this.apiKey ? `${this.apiKey.substring(0, 4)}...` : 'MISSING';
        console.log(`🔑 NBA API Key loaded: ${keyPreview}`);

        this.headers = {
            'Authorization': this.apiKey
        };
    }

    async getGames(date) {
        try {
            // If no date provided, use today
            const targetDate = date || new Date().toISOString().split('T')[0];

            console.log(`Fetching NBA games for ${targetDate}...`);

            const response = await axios.get(`${this.baseUrl}/games`, {
                headers: this.headers,
                params: {
                    dates: [targetDate]
                }
            });

            const games = response.data.data;
            console.log(`Found ${games.length} games.`);

            // Save to Firestore
            if (db && games.length > 0) {
                const batch = db.batch();

                games.forEach(game => {
                    const gameRef = db.collection('nba_games').doc(game.id.toString());
                    batch.set(gameRef, {
                        ...game,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                });

                await batch.commit();
                console.log('Games saved to Firestore.');
            }

            return games;
        } catch (error) {
            console.error('Error fetching NBA games:', error.message);
            throw error;
        }
    }
    async getLiveStats(gameId) {
        try {
            console.log(`Fetching live stats for game ${gameId}...`);

            // Fetch stats for this specific game
            const response = await axios.get(`${this.baseUrl}/stats`, {
                headers: this.headers,
                params: {
                    game_ids: [gameId],
                    per_page: 100 // Get all players
                }
            });

            const stats = response.data.data;
            console.log(`Found ${stats.length} player stats entries.`);

            return stats;
        } catch (error) {
            console.error('Error fetching live stats:', error.message);
            return [];
        }
    }
}

module.exports = new NBAService();
