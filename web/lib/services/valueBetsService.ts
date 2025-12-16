export interface ValueBet {
    id: string;
    sport: 'football' | 'basketball';
    league: string;
    homeTeam: string;
    awayTeam: string;
    market: string; // e.g., "Home Win", "Over 2.5 Goals"
    selection: string; // The pick
    bookmaker: string;
    odds: number;
    impliedProbability: number; // 1 / odds
    aiProbability: number; // Our model's confidence
    edge: number; // The value (AI Prob - Implied Prob)
    startTime: number;
    confidenceScore: number; // 1-10
}

class ValueBetsService {
    // Mock Data Generator for MVP
    async getValueBets(): Promise<ValueBet[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                id: 'vb-001',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Los Angeles Lakers',
                awayTeam: 'Phoenix Suns',
                market: 'Moneyline',
                selection: 'Lakers',
                bookmaker: 'Bet365',
                odds: 2.10,
                impliedProbability: 47.6, // 1/2.10
                aiProbability: 58.5,
                edge: 10.9,
                startTime: Date.now() + 3600000,
                confidenceScore: 8.5
            },
            {
                id: 'vb-002',
                sport: 'football',
                league: 'Premier League',
                homeTeam: 'Aston Villa',
                awayTeam: 'Chelsea',
                market: 'Total Goals',
                selection: 'Over 2.5',
                bookmaker: 'Pinnacle',
                odds: 1.95,
                impliedProbability: 51.3,
                aiProbability: 65.0,
                edge: 13.7,
                startTime: Date.now() + 7200000,
                confidenceScore: 9.2
            },
            {
                id: 'vb-003',
                sport: 'basketball',
                league: 'Euroleague',
                homeTeam: 'Real Madrid',
                awayTeam: 'Barcelona',
                market: 'Handicap -4.5',
                selection: 'Real Madrid',
                bookmaker: '1xBet',
                odds: 1.88,
                impliedProbability: 53.2,
                aiProbability: 61.2,
                edge: 8.0,
                startTime: Date.now() + 10800000,
                confidenceScore: 7.8
            },
            {
                id: 'vb-004',
                sport: 'football',
                league: 'La Liga',
                homeTeam: 'Girona',
                awayTeam: 'Valencia',
                market: 'Both Teams to Score',
                selection: 'Yes',
                bookmaker: 'Betfair',
                odds: 1.75,
                impliedProbability: 57.1,
                aiProbability: 66.5,
                edge: 9.4,
                startTime: Date.now() + 14800000,
                confidenceScore: 8.1
            }
        ];
    }
}

export const valueBetsService = new ValueBetsService();
