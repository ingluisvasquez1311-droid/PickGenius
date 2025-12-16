import { memoryCache } from './memoryCache';
import { historyService } from './historyService';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    fromCache?: boolean;
}

class SofaScoreFootballService {
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

            console.log(`🌐 SofaScore Football API: Fetching ${endpoint}...`);
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
