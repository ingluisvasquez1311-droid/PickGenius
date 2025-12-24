import { memoryCache } from './memoryCache';
import { historyService } from './historyService';
import { sportsDataService } from './sportsDataService';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    fromCache?: boolean;
}

class BasketballDataService {
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

            // Use the unified sportsDataService for proxying and bypass
            const data = await sportsDataService.makeRequest<T>(endpoint);

            if (!data) {
                const isServer = typeof window === 'undefined';
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const scraperKey = process.env.SCRAPER_API_KEY;
                const useProxy = process.env.USE_PROXY;

                // More detailed error message for debugging
                const errorMsg = `[BASKETBALL] makeRequest returned null for ${endpoint}. ENV CHECK: isServer=${isServer}, hasApiUrl=${!!apiUrl}, apiUrl=${apiUrl}, hasScraperKey=${!!scraperKey}, useProxy=${useProxy}`;
                console.error(`❌ ${errorMsg}`);
                throw new Error(errorMsg);
            }

            // Cache the successful response
            memoryCache.set(cacheKey, data, ttlSeconds);

            return { success: true, data, fromCache: false };
        } catch (error: any) {
            console.error(`❌ Basketball API Error (${endpoint}):`, error.message);
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
    /**
     * Get Best Players for an event with fallback to lineups
     */
    async getBestPlayers(eventId: string): Promise<ApiResponse> {
        // 1. Try dedicated endpoint first
        const bestPlayersRes = await this.makeRequest(
            `/event/${eventId}/best-players`,
            `basketball_best_players_${eventId}`,
            120
        );

        if (bestPlayersRes.success) {
            return bestPlayersRes;
        }

        console.log(`⚠️ 'best-players' endpoint failed for ${eventId}. Falling back to lineups...`);

        // 2. Fallback: Calculate from lineups
        const lineupsRes = await this.getLineups(eventId);

        if (!lineupsRes.success || !lineupsRes.data) {
            return { success: false, error: 'Could not fetch lineups for fallback' };
        }

        const homePlayers = lineupsRes.data.home?.players || [];
        const awayPlayers = lineupsRes.data.away?.players || [];

        // Helper to sort players by rating
        const sortByRating = (players: any[]) => {
            return players
                .filter(p => p.statistics && (p.statistics.rating || p.statistics.points))
                .sort((a, b) => (b.statistics.rating || 0) - (a.statistics.rating || 0))
                .slice(0, 5) // Top 5
                .map(p => ({
                    player: {
                        name: p.player.name,
                        id: p.player.id,
                        position: p.position,
                        slug: p.player.slug
                    },
                    statistics: {
                        rating: p.statistics.rating,
                        points: p.statistics.points,
                        rebounds: p.statistics.rebounds,
                        assists: p.statistics.assists
                    },
                    position: p.position
                }));
        };

        const topHome = sortByRating(homePlayers);
        const topAway = sortByRating(awayPlayers);

        // Construct response in same format as best-players endpoint
        const fallbackData = {
            bestPlayers: {
                bestHomeTeamPlayer: topHome[0] || null,
                bestAwayTeamPlayer: topAway[0] || null,
                homeTeamPlayers: topHome,
                awayTeamPlayers: topAway
            }
        };

        return { success: true, data: fallbackData };
    }

    /**
     * Get unique tournament details (includes current season ID)
     */
    async getTournamentDetails(uniqueTournamentId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/unique-tournament/${uniqueTournamentId}`,
            `basketball_tournament_${uniqueTournamentId}`,
            86400 // Cache for 24 hours
        );
    }

    /**
     * Get scheduled events for a specific date (YYYY-MM-DD)
     */
    async getScheduledEvents(date: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/sport/basketball/events/${date}`,
            `basketball_scheduled_${date}`,
            300 // 5 minutes cache
        );
    }
}

// Export singleton instance
export const basketballDataService = new BasketballDataService();
