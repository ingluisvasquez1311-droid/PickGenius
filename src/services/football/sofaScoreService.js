const axios = require('axios');
const memoryCache = require('../memoryCache');
const historyService = require('../HistoryService');
const proxyService = require('../proxyService');

class SofaScoreService {
    constructor() {
        this.baseUrl = 'https://www.sofascore.com/api/v1';
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // 2 seconds between requests

        // Pool of User-Agents to rotate
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        ];

        this.baseHeaders = {
            'Accept': '*/*',
            'Accept-Language': 'es-419,es-US;q=0.9,es;q=0.8,en;q=0.7',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive'
        };
    }

    /**
     * Get a random User-Agent from the pool
     */
    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    /**
     * Rate limiting: wait if needed before making request
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`⏳ Rate limit: waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
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

            // Enforce rate limiting
            await this.enforceRateLimit();

            // Build request with rotated User-Agent
            const headers = {
                ...this.baseHeaders,
                'User-Agent': this.getRandomUserAgent()
            };

            const url = `${this.baseUrl}${endpoint}`;
            console.log(`🌐 SofaScore Football API: Fetching ${endpoint}...`);

            // Use proxy service with retry logic
            const response = await proxyService.makeRequestWithRetry(url, { headers }, 3);

            // Cache the successful response
            if (response.data) {
                memoryCache.set(cacheKey, response.data, ttlSeconds);
            }

            return { success: true, data: response.data, fromCache: false };
        } catch (error) {
            const statusCode = error.response?.status || 'Unknown';
            console.error(`❌ SofaScore Football API Error (${endpoint}): HTTP ${statusCode}: ${error.message}`);
            return { success: false, error: `HTTP ${statusCode}: ${error.message}` };
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
