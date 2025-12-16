import { memoryCache } from './memoryCache';
import { historyService } from './historyService';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    fromCache?: boolean;
}

class SofaScoreBasketballService {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor() {
        this.baseUrl = 'https://www.sofascore.com/api/v1';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        };
    }

    /**
     * Generic method to make requests with caching
     */
    async makeRequest<T = any>(endpoint: string, cacheKey: string, ttlSeconds: number = 60): Promise<ApiResponse<T>> {
        try {
            // Check cache first
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) {
                return { success: true, data: cachedData, fromCache: true };
            }

            console.log(`🌐 SofaScore Basketball API: Fetching ${endpoint}...`);
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: this.headers,
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the successful response
            if (data) {
                memoryCache.set(cacheKey, data, ttlSeconds);
            }

            return { success: true, data, fromCache: false };
        } catch (error: any) {
            console.error(`❌ SofaScore Basketball API Error (${endpoint}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get live basketball events
     */
    async getLiveEvents(): Promise<ApiResponse> {
        return this.makeRequest(
            '/sport/basketball/events/live',
            'basketball_live_events',
            30 // Short TTL for live data
        );
    }

    /**
     * Get details for a specific game
     */
    async getEventDetails(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}`,
            `basketball_event_${eventId}`,
            300 // 5 minutes
        );
    }

    /**
     * Get detailed statistics for a specific game
     */
    async getEventStatistics(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/statistics`,
            `basketball_stats_${eventId}`,
            60 // 1 minute for live stats
        );
    }

    /**
     * Parse statistics into a structured format
     */
    parseStatistics(statisticsData: any): any {
        if (!statisticsData || !statisticsData.statistics) {
            return null;
        }

        const parsed: any = {
            periods: []
        };

        statisticsData.statistics.forEach((periodStat: any) => {
            const periodData: any = {
                period: periodStat.period,
                scoring: {},
                rebounds: {},
                other: {}
            };

            periodStat.groups.forEach((group: any) => {
                const groupName = group.groupName;

                group.statisticsItems.forEach((item: any) => {
                    const statData = {
                        name: item.name,
                        home: item.home,
                        away: item.away,
                        homeValue: item.homeValue,
                        awayValue: item.awayValue,
                        homeTotal: item.homeTotal,
                        awayTotal: item.awayTotal,
                        compareCode: item.compareCode
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
    async getFormattedGameStats(eventId: string): Promise<ApiResponse> {
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
    async getLineups(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/lineups`,
            `basketball_lineups_${eventId}`,
            300
        );
    }

    /**
     * Get standings for a tournament season
     */
    async getStandings(tournamentId: string, seasonId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/tournament/${tournamentId}/season/${seasonId}/standings/total`,
            `basketball_standings_${tournamentId}_${seasonId}`,
            3600
        );
    }

    /**
     * Get incidents (quarters, points) for an event
     */
    async getIncidents(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/incidents`,
            `basketball_incidents_${eventId}`,
            60
        );
    }

    /**
     * Get Head to Head history for an event
     */
    async getH2H(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/h2h/events`,
            `basketball_h2h_${eventId}`,
            86400
        );
    }

    /**
     * Get Best Players for an event
     */
    async getBestPlayers(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/best-players`,
            `basketball_best_players_${eventId}`,
            120 // 2 minutes cache
        );
    }

    /**
     * Get scheduled events for a specific date (YYYY-MM-DD)
     */
    async getScheduledEvents(date: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/sport/basketball/scheduled-events/${date}`,
            `basketball_scheduled_${date}`,
            300 // 5 minutes cache
        );
    }
}

// Export singleton instance
export const sofaScoreBasketballService = new SofaScoreBasketballService();
