

export interface Streak {
    id: string;
    teamName: string;
    teamLogo: string;
    sport: 'football' | 'basketball';
    type: 'win' | 'loss' | 'draw' | 'over_2.5_goals' | 'btts';
    count: number;
    league: string;
    lastMatch: string;
    nextMatch?: string;
    confidenceScore: number;
}

class StreakService {
    // Cache for streaks
    private streaksCache: Streak[] | null = null;
    private lastFetch: number = 0;

    async getStreaks(): Promise<Streak[]> {
        // Cache for 1 hour
        if (this.streaksCache && (Date.now() - this.lastFetch < 3600000)) {
            return this.streaksCache;
        }

        const footballStreaks = await this.analyzeFootballStreaks();
        const basketballStreaks = await this.analyzeBasketballStreaks();

        this.streaksCache = [...footballStreaks, ...basketballStreaks].sort((a, b) => b.count - a.count);
        this.lastFetch = Date.now();

        return this.streaksCache;
    }

    private async analyzeFootballStreaks(): Promise<Streak[]> {
        // In a real implementation this would fetch standings from multiple major leagues
        // For MVP, we will mock high-quality data that looks like it came from Sofascore form analysis

        // Simulating analyzing "Form" from standings
        return [
            {
                id: 's-f-1',
                teamName: 'Bayer Leverkusen',
                teamLogo: 'https://api.sofascore.app/api/v1/team/2672/image',
                sport: 'football',
                type: 'win',
                count: 8,
                league: 'Bundesliga',
                lastMatch: 'vs Bayern (3-0)',
                confidenceScore: 9.5
            },
            {
                id: 's-f-2',
                teamName: 'Sheffield United',
                teamLogo: 'https://api.sofascore.app/api/v1/team/15/image',
                sport: 'football',
                type: 'loss',
                count: 6,
                league: 'Premier League',
                lastMatch: 'vs Arsenal (0-6)',
                confidenceScore: 9.0
            },
            {
                id: 's-f-3',
                teamName: 'Inter Miami',
                teamLogo: 'https://api.sofascore.app/api/v1/team/33333/image',
                sport: 'football',
                type: 'over_2.5_goals',
                count: 5,
                league: 'MLS',
                lastMatch: 'vs Orlando (5-0)',
                confidenceScore: 8.5
            }
        ];
    }

    private async analyzeBasketballStreaks(): Promise<Streak[]> {
        return [
            {
                id: 's-b-1',
                teamName: 'Boston Celtics',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3416/image',
                sport: 'basketball',
                type: 'win',
                count: 11,
                league: 'NBA',
                lastMatch: 'vs Warriors (140-88)',
                confidenceScore: 9.8
            },
            {
                id: 's-b-2',
                teamName: 'Detroit Pistons',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3410/image',
                sport: 'basketball',
                type: 'loss',
                count: 4,
                league: 'NBA',
                lastMatch: 'vs Magic (91-113)',
                confidenceScore: 8.0
            }
        ];
    }
}

export const streakService = new StreakService();
