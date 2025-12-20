// src/services/generalizedSofaScoreService.js
const axios = require('axios');
const memoryCache = require('./memoryCache');
const proxyService = require('./proxyService');

class GeneralizedSofaScoreService {
    constructor() {
        this.baseUrl = 'https://www.sofascore.com/api/v1';
        this.sportsMap = {
            'football': 1,
            'soccer': 1,
            'basketball': 2,
            'tennis': 3,
            'icehockey': 4,
            'nhl': 4,
            'baseball': 16,
            'mlb': 16,
            'american-football': 12,
            'nfl': 12,
            'handball': 31,
            'volleyball': 5
        };

        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async makeRequest(endpoint, cacheKey, ttlSeconds = 60) {
        try {
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) return { success: true, data: cachedData, fromCache: true };

            const headers = {
                'Accept': '*/*',
                'User-Agent': this.getRandomUserAgent(),
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com'
            };

            const url = `${this.baseUrl}${endpoint}`;
            const response = await proxyService.makeRequestWithRetry(url, { headers }, 3);

            if (response.data) {
                memoryCache.set(cacheKey, response.data, ttlSeconds);
            }

            return { success: true, data: response.data, fromCache: false };
        } catch (error) {
            console.error(`❌ SofaScore General API Error (${endpoint}): ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    getSportId(sportName) {
        return this.sportsMap[sportName.toLowerCase()] || 1;
    }

    /**
     * Obtener eventos en vivo por deporte
     */
    async getLiveEvents(sport) {
        const sportId = this.getSportId(sport);
        const sportName = Object.keys(this.sportsMap).find(key => this.sportsMap[key] === sportId) || sport;

        return this.makeRequest(
            `/sport/${sportName}/events/live`,
            `live_events_${sportId}`,
            30
        );
    }

    /**
     * Obtener eventos programados para una fecha
     */
    async getEventsByDate(sport, dateString) {
        // dateString: YYYY-MM-DD
        const sportId = this.getSportId(sport);
        const sportName = Object.keys(this.sportsMap).find(key => this.sportsMap[key] === sportId) || sport;

        return this.makeRequest(
            `/sport/${sportName}/events/${dateString}`,
            `events_${sportId}_${dateString}`,
            300
        );
    }

    async getEventDetails(eventId) {
        return this.makeRequest(`/event/${eventId}`, `event_details_${eventId}`, 300);
    }

    async getEventStatistics(eventId) {
        return this.makeRequest(`/event/${eventId}/statistics`, `event_stats_${eventId}`, 60);
    }

    async getEventLineups(eventId) {
        return this.makeRequest(`/event/${eventId}/lineups`, `event_lineups_${eventId}`, 300);
    }

    /**
     * Obtener últimos eventos de un jugador (Game Log) universal
     */
    async getPlayerLastEvents(playerId) {
        return this.makeRequest(`/player/${playerId}/events/last/0`, `player_events_${playerId}`, 3600);
    }

    async getH2H(eventId) {
        return this.makeRequest(`/event/${eventId}/h2h/events`, `event_h2h_${eventId}`, 86400);
    }

    async getTournamentDetails(uniqueTournamentId) {
        return this.makeRequest(`/unique-tournament/${uniqueTournamentId}`, `tournament_details_${uniqueTournamentId}`, 86400);
    }

    async getStandings(tournamentId, seasonId) {
        return this.makeRequest(`/tournament/${tournamentId}/season/${seasonId}/standings/total`, `standings_${tournamentId}_${seasonId}`, 3600);
    }
}

module.exports = new GeneralizedSofaScoreService();
