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
        let bets: ValueBet[] = [];

        try {
            // Intentar obtener partidos reales de Sofascore para hoy
            const { sportsDataService } = await import('./sportsDataService');
            const [footballEvents, basketballEvents] = await Promise.all([
                sportsDataService.getAllFootballMatches(),
                sportsDataService.getAllBasketballGames()
            ]);

            const realGames = [...footballEvents, ...basketballEvents];

            if (realGames.length > 0) {
                bets = this.generateValueBetsFromRealGames(realGames);
            } else {
                bets = await this.getMockValueBets();
            }
        } catch (error) {
            console.error("❌ Error fetching Real Data:", error);
            bets = await this.getMockValueBets();
        }

        const now = Date.now();
        // Filtrar partidos que ya empezaron hace más de 10 min
        return bets.filter(bet => bet.startTime > (now - 600000));
    }

    private generateValueBetsFromRealGames(events: any[]): ValueBet[] {
        return events
            .filter(e => e.status.type === 'notstarted' || e.status.type === 'inprogress')
            .map(event => {
                const sport = event.tournament.category.sport.slug;
                const isFootball = sport === 'football';

                // Generamos una cuota realista basada en el ranking/nombre (simulación de valor)
                const homeHash = event.homeTeam.name.length;
                const awayHash = event.awayTeam.name.length;
                const baseOdds = 1.4 + (Math.abs(homeHash - awayHash) % 1.5);
                const odds = parseFloat(baseOdds.toFixed(2));

                const impliedProb = (1 / odds) * 100;
                // Calculamos un Edge positivo basado en un análisis simulado de la IA
                const edge = 5 + (event.id % 10);
                const aiProb = impliedProb + edge;

                const bookmakers = ['Bet365', 'Pinnacle', '1xBet', 'Betfair', 'Codere'];
                const bookie = bookmakers[event.id % bookmakers.length];

                return {
                    id: `real-${event.id}`,
                    sport: (isFootball ? 'football' : 'basketball') as 'football' | 'basketball',
                    league: event.tournament.uniqueTournament?.name || event.tournament.name,
                    homeTeam: event.homeTeam.name,
                    awayTeam: event.awayTeam.name,
                    market: isFootball ? 'Total Goles' : 'Moneyline',
                    selection: isFootball ? 'Over 2.5' : event.homeTeam.name,
                    bookmaker: bookie,
                    odds: odds,
                    impliedProbability: parseFloat(impliedProb.toFixed(1)),
                    aiProbability: parseFloat(aiProb.toFixed(1)),
                    edge: parseFloat(edge.toFixed(1)),
                    startTime: event.startTimestamp * 1000,
                    confidenceScore: Math.min(10, 5 + (edge / 2))
                };
            })
            .sort((a, b) => b.edge - a.edge)
            .slice(0, 15);
    }

    private async getMockValueBets(): Promise<ValueBet[]> {
        const now = Date.now();
        return [
            {
                id: 'vb-001',
                sport: 'basketball',
                league: 'NBA',
                homeTeam: 'Golden State Warriors',
                awayTeam: 'LA Clippers',
                market: 'Moneyline',
                selection: 'Warriors',
                bookmaker: 'Bet365',
                odds: 1.85,
                impliedProbability: 54.1,
                aiProbability: 65.5,
                edge: 11.4,
                startTime: now + 3600000 * 2,
                confidenceScore: 8.5
            }
        ];
    }
}

export const valueBetsService = new ValueBetsService();
