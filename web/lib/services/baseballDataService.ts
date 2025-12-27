import { memoryCache } from './memoryCache';
import { sportsDataService } from './sportsDataService';
import { fetchAPI } from '../api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    fromCache?: boolean;
}

class BaseballDataService {
    private baseUrl: string = typeof window === 'undefined'
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/proxy/sportsdata`
        : '/api/proxy/sportsdata';
    private headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    async makeRequest<T = any>(endpoint: string, cacheKey: string, ttlSeconds: number = 3600): Promise<ApiResponse<T>> {
        try {
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) return { success: true, data: cachedData, fromCache: true };

            const responseData = await fetchAPI(`${this.baseUrl}${endpoint}`, { headers: this.headers });
            const data = responseData;
            memoryCache.set(cacheKey, data, ttlSeconds);
            return { success: true, data, fromCache: false };
        } catch (error: any) {
            console.error(`❌ Baseball Data Error (${endpoint}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    async getTournamentDetails(id: string) {
        return this.makeRequest(`/unique-tournament/${id}`, `baseball_tournament_${id}`, 86400);
    }

    async getStandings(tournamentId: string, seasonId: string) {
        return this.makeRequest(`/tournament/${tournamentId}/season/${seasonId}/standings/total`, `baseball_standings_${tournamentId}_${seasonId}`, 3600);
    }
}

export const baseballDataService = new BaseballDataService();
