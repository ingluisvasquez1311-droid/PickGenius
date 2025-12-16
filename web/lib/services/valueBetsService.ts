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
    private apiKey: string | undefined;
    private baseUrl: string = 'https://api.the-odds-api.com/v4/sports';

    constructor() {
        this.apiKey = process.env.THE_ODDS_API_KEY;
    }

    // Get Value Bets (Real or Mock)
    async getValueBets(): Promise<ValueBet[]> {
        if (this.apiKey) {
            try {
                return await this.fetchRealValueBets();
            } catch (error) {
                console.error("❌ Error fetching Real Odds:", error);
                return this.getMockValueBets(); // Fallback on error
            }
        }

        console.warn("⚠️ No THE_ODDS_API_KEY found, using Mock Data.");
        return this.getMockValueBets();
    }

    private async fetchRealValueBets(): Promise<ValueBet[]> {
        // Fetch NBA and EPL odds for demonstration
        const sports = ['basketball_nba', 'soccer_epl'];
        let allBets: ValueBet[] = [];

        for (const sport of sports) {
            const response = await fetch(`${this.baseUrl}/${sport}/odds/?apiKey=${this.apiKey}&regions=us,eu&markets=h2h,totals&oddsFormat=decimal`);
            if (!response.ok) continue;

            const events = await response.json();

            // Transform and Calculate Edge
            const bets = events.map((event: any) => this.analyzeEventForValue(event, sport)).filter(Boolean);
            allBets = [...allBets, ...bets];
        }

        // Return top 5 value bets
        return allBets.sort((a, b) => b.edge - a.edge).slice(0, 5);
    }

    private analyzeEventForValue(event: any, sportKey: string): ValueBet | null {
        // Simple logic: Find the best odds and compare with our "AI Model" (Simulated for now)
        // In a full implementation, we would query our AI Probability endpoint here.

        const bookmakers = event.bookmakers;
        if (!bookmakers || bookmakers.length === 0) return null;

        // Find best odds for Home Team
        let bestOdds = 0;
        let bestBookie = '';
        let selection = event.home_team;

        bookmakers.forEach((bookie: any) => {
            const market = bookie.markets.find((m: any) => m.key === 'h2h');
            if (market) {
                const outcome = market.outcomes.find((o: any) => o.name === event.home_team);
                if (outcome && outcome.price > bestOdds) {
                    bestOdds = outcome.price;
                    bestBookie = bookie.title;
                }
            }
        });

        if (bestOdds === 0) return null;

        const impliedProb = (1 / bestOdds) * 100;

        // SIMULATED AI PROBABILITY (For Demo) / (To be replaced with real AI call)
        // We simulate that the AI is slightly smarter than the market for specific conditions
        const aiProb = impliedProb + (Math.random() * 15 - 5); // Random edge between -5% and +10%

        const edge = aiProb - impliedProb;

        if (edge > 2) { // Only return if there is > 2% value
            return {
                id: event.id,
                sport: sportKey.includes('basketball') ? 'basketball' : 'football',
                league: sportKey === 'basketball_nba' ? 'NBA' : 'Premier League',
                homeTeam: event.home_team,
                awayTeam: event.away_team,
                market: 'Winner (H2H)',
                selection: event.home_team,
                bookmaker: bestBookie,
                odds: bestOdds,
                impliedProbability: parseFloat(impliedProb.toFixed(1)),
                aiProbability: parseFloat(aiProb.toFixed(1)),
                edge: parseFloat(edge.toFixed(1)),
                startTime: new Date(event.commence_time).getTime(),
                confidenceScore: Math.min(10, 5 + (edge / 2)) // Score based on edge
            };
        }

        return null;
    }

    private async getMockValueBets(): Promise<ValueBet[]> {
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
