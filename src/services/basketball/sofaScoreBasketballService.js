const axios = require('axios');
const memoryCache = require('../memoryCache');
const historyService = require('../HistoryService');

class SofaScoreBasketballService {
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

            console.log(`🌐 SofaScore Basketball API: Fetching ${endpoint}...`);
            const response = await axios.get(`${this.baseUrl}${endpoint}`, { headers: this.headers });

            // Cache the successful response
            if (response.data) {
                memoryCache.set(cacheKey, response.data, ttlSeconds);
            }

            return { success: true, data: response.data, fromCache: false };
        } catch (error) {
            console.error(`❌ SofaScore Basketball API Error (${endpoint}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get live basketball events
     */
    async getLiveEvents() {
        return this.makeRequest(
            '/sport/basketball/events/live',
            'basketball_live_events',
            30 // Short TTL for live data
        );
    }

    /**
     * Get details for a specific game
     */
    async getEventDetails(eventId) {
        return this.makeRequest(
            `/event/${eventId}`,
            `basketball_event_${eventId}`,
            300 // 5 minutes
        );
    }

    /**
     * Get detailed statistics for a specific game
     * Includes: points, rebounds, assists, steals, blocks, etc.
     */
    async getEventStatistics(eventId) {
        return this.makeRequest(
            `/event/${eventId}/statistics`,
            `basketball_stats_${eventId}`,
            60 // 1 minute for live stats
        );
    }

    /**
     * Parse statistics into a structured format
     * This extracts the detailed stats like rebounds, points, etc.
     */
    parseStatistics(statisticsData) {
        if (!statisticsData || !statisticsData.statistics) {
            return null;
        }

        const parsed = {
            periods: []
        };

        statisticsData.statistics.forEach(periodStat => {
            const periodData = {
                period: periodStat.period,
                scoring: {},
                rebounds: {},
                other: {}
            };

            periodStat.groups.forEach(group => {
                const groupName = group.groupName;

                group.statisticsItems.forEach(item => {
                    const statData = {
                        name: item.name,
                        home: item.home,
                        away: item.away,
                        homeValue: item.homeValue,
                        awayValue: item.awayValue,
                        homeTotal: item.homeTotal,
                        awayTotal: item.awayTotal,
                        compareCode: item.compareCode // 1 = home mejor, 2 = empate, 3 = away mejor
                    };

                    // Categorizar por grupo
                    if (groupName === 'Scoring') {
                        periodData.scoring[item.name] = statData;
                    } else if (groupName === 'Rebounds') {
                        periodData.rebounds[item.name] = statData;
                    } else {
                        periodData.other[item.name] = statData;
                    }
                });
            });

            parsed.periods.push(periodData);
        });

        return parsed;
    }



    /**
     * Get formatted game statistics (ready for display)
     */
    async getFormattedGameStats(eventId) {
        const response = await this.getEventStatistics(eventId);

        if (!response.success) {
            return response;
        }

        const parsed = this.parseStatistics(response.data);

        // Save snapshot to history for AI analysis
        if (parsed) {
            historyService.saveSnapshot(eventId, parsed, 'basketball');
        }

        return {
            success: true,
            data: parsed,
            fromCache: response.fromCache
        };
    }

    /**
     * Get lineups for a specific event
     */
    async getLineups(eventId) {
        return this.makeRequest(
            `/event/${eventId}/lineups`,
            `basketball_lineups_${eventId}`,
            300
        );
    }

    /**
     * Get standings for a tournament season
     */
    async getStandings(tournamentId, seasonId) {
        return this.makeRequest(
            `/tournament/${tournamentId}/season/${seasonId}/standings/total`,
            `basketball_standings_${tournamentId}_${seasonId}`,
            3600
        );
    }

    /**
     * Get incidents (quarters, points) for an event
     */
    async getIncidents(eventId) {
        return this.makeRequest(
            `/event/${eventId}/incidents`,
            `basketball_incidents_${eventId}`,
            60
        );
    }

    /**
     * Get Head to Head history for an event
     */
    async getH2H(eventId) {
        return this.makeRequest(
            `/event/${eventId}/h2h/events`,
            `basketball_h2h_${eventId}`,
            86400
        );
    }
}

module.exports = new SofaScoreBasketballService();
