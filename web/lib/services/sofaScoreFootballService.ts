import { memoryCache } from './memoryCache';
import { sofascoreService } from './sofascoreService';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    fromCache?: boolean;
}

class SofaScoreFootballService {
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

            // Use the unified sofascoreService for proxying and bypass
            const data = await sofascoreService.makeRequest<T>(endpoint);

            if (!data) {
                throw new Error(`Provider unavailable for ${endpoint}`);
            }

            // Cache the successful response
            memoryCache.set(cacheKey, data, ttlSeconds);

            return { success: true, data, fromCache: false };
        } catch (error: any) {
            console.error(`❌ SofaScore Football API Error (${endpoint}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get live football events
     */
    async getLiveEvents(): Promise<ApiResponse> {
        return this.makeRequest(
            '/sport/football/events/live',
            'football_live_events',
            30 // Short TTL for live data
        );
    }

    /**
     * Get details for a specific match
     */
    async getEventDetails(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}`,
            `football_event_${eventId}`,
            300 // 5 minutes
        );
    }

    /**
     * Get statistics for a specific match
     */
    async getEventStatistics(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/statistics`,
            `football_stats_${eventId}`,
            60 // 1 minute for live stats
        );
    }

    /**
     * Get lineups for a specific match
     */
    async getLineups(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/lineups`,
            `football_lineups_${eventId}`,
            300
        );
    }

    /**
     * Get incidents for a specific match
     */
    async getIncidents(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/incidents`,
            `football_incidents_${eventId}`,
            60
        );
    }

    /**
     * Get Head to Head history for a match
     */
    async getH2H(eventId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/event/${eventId}/h2h/events`,
            `football_h2h_${eventId}`,
            86400 // 24 hours
        );
    }

    /**
     * Get standings for a tournament season
     */
    async getStandings(tournamentId: string, seasonId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/tournament/${tournamentId}/season/${seasonId}/standings/total`,
            `football_standings_${tournamentId}_${seasonId}`,
            3600 // 1 hour
        );
    }
    /**
     * Get unique tournament details (includes current season ID)
     */
    async getTournamentDetails(uniqueTournamentId: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/unique-tournament/${uniqueTournamentId}`,
            `football_tournament_${uniqueTournamentId}`,
            86400 // Cache for 24 hours (seasons don't change often)
        );
    }

    /**
     * Get scheduled events for a specific date (YYYY-MM-DD)
     */
    async getScheduledEvents(date: string): Promise<ApiResponse> {
        return this.makeRequest(
            `/sport/football/scheduled-events/${date}`,
            `football_scheduled_${date}`,
            300 // 5 minutes cache
        );
    }
}

// Export singleton instance
export const sofaScoreFootballService = new SofaScoreFootballService();
