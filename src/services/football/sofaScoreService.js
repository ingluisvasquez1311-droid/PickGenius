const axios = require('axios');
const memoryCache = require('../memoryCache');
const historyService = require('../HistoryService');

class SofaScoreService {
    constructor() {
        this.baseUrl = 'https://www.sofascore.com/api/v1';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-419,es-US;q=0.9,es;q=0.8,en;q=0.7',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive'
        };
    }

    /**
     * Generic method to make requests with caching
     */
    async makeRequest(endpoint, cacheKey, ttlSeconds = 60) {
        try {
            // Check cache first
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) {
                return { success: true, data: cachedData, fromCache: true };
            }

            console.log(`🌐 SofaScore API: Fetching ${endpoint}...`);
            const response = await axios.get(`${this.baseUrl}${endpoint}`, { headers: this.headers });

            // Cache the successful response
            if (response.data) {
                memoryCache.set(cacheKey, response.data, ttlSeconds);
            }

            return { success: true, data: response.data, fromCache: false };
        } catch (error) {
            console.error(`❌ SofaScore API Error (${endpoint}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get live football events
     */
    async getLiveEvents() {
        return this.makeRequest(
            '/sport/football/events/live',
            'live_events',
            30 // Short TTL for live data
        );
    }

    /**
     * Get details for a specific event (match)
     */
    async getEventDetails(eventId) {
        return this.makeRequest(
            `/event/${eventId}`,
            `event_${eventId}`,
            300 // 5 minutes
        );
    }

    /**
     * Get statistics for a specific event
     */
    async getEventStatistics(eventId) {
        const result = await this.makeRequest(
            `/event/${eventId}/statistics`,
            `event_stats_${eventId}`,
            60 // 1 minute for live stats
        );

        // Save snapshot to history for AI analysis
        if (result.success && result.data) {
            historyService.saveSnapshot(eventId, result.data, 'football');
        }

        return result;
    }

    /**
     * Get player statistics for a specific event
     * Note: Player stats are included in lineups endpoint
     */
    async getPlayerStatistics(eventId) {
        return this.makeRequest(
            `/event/${eventId}/lineups`,
            `player_stats_${eventId}`,
            60
        );
    }

    /**
     * Get lineups for a specific event
     */
    async getLineups(eventId) {
        return this.makeRequest(
            `/event/${eventId}/lineups`,
            `lineups_${eventId}`,
            300
        );
    }

    /**
     * Get standings for a tournament season
     */
    async getStandings(tournamentId, seasonId) {
        return this.makeRequest(
            `/tournament/${tournamentId}/season/${seasonId}/standings/total`,
            `standings_${tournamentId}_${seasonId}`,
            3600 // 1 hour cache for standings
        );
    }

    /**
     * Get incidents (goals, cards, subs) for an event
     */
    async getIncidents(eventId) {
        return this.makeRequest(
            `/event/${eventId}/incidents`,
            `incidents_${eventId}`,
            60 // 1 minute for live incidents
        );
    }

    /**
     * Get Head to Head history for an event
     */
    async getH2H(eventId) {
        return this.makeRequest(
            `/event/${eventId}/h2h/events`,
            `h2h_${eventId}`,
            86400 // 24 hours cache for history
        );
    }
}

module.exports = new SofaScoreService();
