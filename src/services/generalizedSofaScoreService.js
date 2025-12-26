// src/services/generalizedSofaScoreService.js
const axios = require('axios');
const memoryCache = require('./memoryCache');

class GeneralizedSofaScoreService {
    constructor() {
        this.baseUrl = 'https://www.sofascore.com/api/v1';
        this.sportsMap = {
            'football': 1,
            'soccer': 1,
            'basketball': 2,
            'tennis': 3,
            'ice-hockey': 4,
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
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async makeRequest(endpoint, cacheKey, ttlSeconds = 60, retries = 2) {
        try {
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) return { success: true, data: cachedData, fromCache: true };

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': this.getRandomUserAgent(),
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com',
                'Cache-Control': 'no-cache'
            };

            const url = `${this.baseUrl}${endpoint}`;

            let lastError;
            for (let i = 0; i <= retries; i++) {
                try {
                    const response = await axios.get(url, { headers, timeout: 8000 });
                    if (response.data) {
                        memoryCache.set(cacheKey, response.data, ttlSeconds);
                        return { success: true, data: response.data, fromCache: false };
                    }
                } catch (err) {
                    lastError = err;
                    if (err.response?.status === 404) break;
                    await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Simple backoff
                }
            }
            throw lastError;
        } catch (error) {
            console.error(`❌ SofaScore General API Error(${endpoint}): ${error.message} `);
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

    /**
     * Obtener eventos programados para las próximas 12 horas
     */
    async getScheduledEvents(sport, dateString, windowHours = 12) {
        const sportId = this.getSportId(sport);
        // Find the "canonical" name for Sofascore (usually the first key with that ID)
        const sportName = Object.keys(this.sportsMap).find(key => this.sportsMap[key] === sportId) || sport;
        const date = dateString || new Date().toISOString().split('T')[0];

        const result = await this.makeRequest(
            `/sport/${sportName}/scheduled-events/${date}`,
            `scheduled_events_${sportId}_${date}`,
            300
        );

        if (result.success && result.data && result.data.events) {
            const now = Math.floor(Date.now() / 1000);
            const windowLimit = now + (windowHours * 60 * 60);

            // Filtrar solo los que empiezan en el futuro y dentro de la ventana
            result.data.events = result.data.events.filter(event => {
                const startTimestamp = event.startTimestamp || 0;
                // Excluir eventos que ya pasaron o que están muy lejos
                // También excluimos los que ya están en vivo (para evitar duplicidad si se juntan listas)
                return startTimestamp > now && startTimestamp <= windowLimit;
            });
        }

        return result;
    }

    async getEventDetails(eventId) {
        return this.makeRequest(`/ event / ${eventId} `, `event_details_${eventId} `, 300);
    }

    async getEventStatistics(eventId) {
        return this.makeRequest(`/ event / ${eventId}/statistics`, `event_stats_${eventId}`, 60);
    }

    async getEventOdds(eventId) {
        return this.makeRequest(`/event/${eventId}/odds/1/all`, `event_odds_${eventId}`, 300);
    }

    async getEventLineups(eventId) {
        return this.makeRequest(`/event/${eventId}/lineups`, `event_lineups_${eventId}`, 300);
    }

    async getBestPlayers(eventId) {
        return this.makeRequest(`/event/${eventId}/best-players`, `event_best_players_${eventId}`, 300);
    }

    async getTeamLogo(teamId) {
        const sources = [
            `https://api.sofascore.app/api/v1/team/${teamId}/image`,
            `https://api.sofascore.com/api/v1/team/${teamId}/image`
        ];

        for (const url of sources) {
            try {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Referer': 'https://www.sofascore.com/',
                        'Origin': 'https://www.sofascore.com',
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                    },
                    timeout: 5000
                });

                if (response && response.status === 200 && response.data) {
                    return response;
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    async getPlayerImage(playerId) {
        const url = `https://api.sofascore.app/api/v1/player/${playerId}/image`;
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'Referer': 'https://www.sofascore.com/',
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 5000
            });
            if (response && response.status === 200 && response.data) return response;
        } catch (e) {
            return null;
        }
        return null;
    }

    async getCategoryImage(categoryId) {
        const url = `https://api.sofascore.app/api/v1/category/${categoryId}/image`;
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'Referer': 'https://www.sofascore.com/',
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 5000
            });
            if (response && response.status === 200 && response.data) return response;
        } catch (e) {
            console.error(`❌ Error fetching category image ${categoryId}:`, e.message);
        }
        return null;
    }

    /**
     * Obtener últimos eventos de un jugador (Game Log) universal
     */
    async getPlayerLastEvents(playerId) {
        return this.makeRequest(`/player/${playerId}/events/last/0`, `player_events_${playerId}`, 3600);
    }

    async getPlayerEventStatistics(playerId, eventId) {
        return this.makeRequest(`/event/${eventId}/player/${playerId}/statistics`, `player_match_stats_${playerId}_${eventId}`, 86400);
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

    /**
     * Universal fetch for raw endpoints (used by proxy)
     */
    async fetchData(endpoint) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return this.makeRequest(cleanEndpoint, `raw_${cleanEndpoint.replace(/\//g, '_')}`, 30);
    }
}

module.exports = new GeneralizedSofaScoreService();
