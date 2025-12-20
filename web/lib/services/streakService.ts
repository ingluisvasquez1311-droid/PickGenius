

export interface Streak {
    id: string;
    teamName: string;
    teamLogo: string;
    sport: 'football' | 'basketball' | 'baseball' | 'nhl';
    type: 'win' | 'loss' | 'draw' | 'over_2.5_goals' | 'btts';
    count: number;
    league: string;
    lastMatch: string;
    nextMatch?: string;
    confidenceScore: number;
}

import { sofaScoreFootballService } from './sofaScoreFootballService';
import { sofaScoreBasketballService } from './sofaScoreBasketballService';
import { sofaScoreBaseballService } from './sofaScoreBaseballService';
import { sofaScoreNHLService } from './sofaScoreNHLService';

const TOP_FOOTBALL_LEAGUES = [
    { name: 'Premier League', id: 17 },
    { name: 'LaLiga', id: 8 },
    { name: 'Serie A', id: 23 },
    { name: 'Bundesliga', id: 35 },
    { name: 'Ligue 1', id: 34 },
    { name: 'Brasileirão', id: 325 },
    { name: 'Liga Profesional', id: 155 } // Argentina
];

const TOP_BASKETBALL_LEAGUES = [
    { name: 'NBA', id: 132 },
    { name: 'Euroleague', id: 138 }
];

const TOP_BASEBALL_LEAGUES = [
    { name: 'MLB', id: 112 }
];

const TOP_NHL_LEAGUES = [
    { name: 'NHL', id: 234 }
];

class StreakService {
    // Cache for streaks
    private streaksCache: Streak[] | null = null;
    private lastFetch: number = 0;

    async getStreaks(): Promise<Streak[]> {
        // Cache for 1 hour to simply avoid spamming stats
        if (this.streaksCache && (Date.now() - this.lastFetch < 3600000)) {
            console.log('⚡ Returning Streaks from Cache');
            return this.streaksCache;
        }

        console.log('🔄 Calculating NEW Real Streaks from Sofascore...');
        try {
            const [footballStreaks, basketballStreaks, baseballStreaks, nhlStreaks] = await Promise.all([
                this.analyzeSportStreaks(TOP_FOOTBALL_LEAGUES, 'football'),
                this.analyzeSportStreaks(TOP_BASKETBALL_LEAGUES, 'basketball'),
                this.analyzeSportStreaks(TOP_BASEBALL_LEAGUES, 'baseball'),
                this.analyzeSportStreaks(TOP_NHL_LEAGUES, 'nhl')
            ]);

            this.streaksCache = [...footballStreaks, ...basketballStreaks, ...baseballStreaks, ...nhlStreaks]
                .sort((a, b) => b.count - a.count);
            this.lastFetch = Date.now();

            return this.streaksCache;
        } catch (error) {
            console.error('Failed to calculate streaks', error);
            return [];
        }
    }

    private async analyzeSportStreaks(leagues: { name: string; id: number }[], sport: 'football' | 'basketball' | 'baseball' | 'nhl'): Promise<Streak[]> {
        const streaks: Streak[] = [];

        const promises = leagues.map(async (league) => {
            try {
                // Determine which service to use
                let service;
                if (sport === 'football') {
                    service = sofaScoreFootballService;
                } else if (sport === 'basketball') {
                    service = sofaScoreBasketballService;
                } else if (sport === 'baseball') {
                    service = sofaScoreBaseballService;
                } else if (sport === 'nhl') {
                    service = sofaScoreNHLService;
                } else {
                    console.warn(`No service defined for sport: ${sport}`);
                    return;
                }

                // 1. Get Current Season ID
                const detailsRes = await service.getTournamentDetails(league.id.toString());
                if (!detailsRes.success || !detailsRes.data.uniqueTournament?.currentSeason?.id) return;

                const currentSeasonId = detailsRes.data.uniqueTournament.currentSeason.id;

                // 2. Get Standings
                const standingsRes = await service.getStandings(league.id.toString(), currentSeasonId.toString());
                if (!standingsRes.success || !standingsRes.data.standings) return;

                // 3. Analyze Form
                const totalTable = standingsRes.data.standings.find((s: any) => s.type === 'total');
                if (!totalTable || !totalTable.rows) return;

                for (const row of totalTable.rows) {
                    if (row.form && Array.isArray(row.form)) {
                        const form = row.form;

                        let winCount = 0;
                        let lossCount = 0;

                        // Check backwards for streak
                        for (let i = form.length - 1; i >= 0; i--) {
                            if (form[i] === 'W') winCount++;
                            else break;
                        }

                        for (let i = form.length - 1; i >= 0; i--) {
                            if (form[i] === 'L') lossCount++;
                            else break;
                        }

                        if (winCount >= 3) {
                            streaks.push({
                                id: `real-win-${sport}-${row.team.id}`,
                                teamName: row.team.name,
                                teamLogo: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
                                sport: sport,
                                type: 'win',
                                count: winCount,
                                league: league.name,
                                lastMatch: 'Reciente',
                                confidenceScore: 8 + (winCount * 0.2)
                            });
                        }

                        if (lossCount >= 3) {
                            streaks.push({
                                id: `real-loss-${sport}-${row.team.id}`,
                                teamName: row.team.name,
                                teamLogo: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
                                sport: sport,
                                type: 'loss',
                                count: lossCount,
                                league: league.name,
                                lastMatch: 'Reciente',
                                confidenceScore: 7 + (lossCount * 0.2)
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(`Error processing ${sport} league ${league.name}`, e);
            }
        });

        await Promise.all(promises);
        return streaks;
    }

}

export const streakService = new StreakService();
