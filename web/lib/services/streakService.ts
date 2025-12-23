

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

export interface PlayerStreak {
    id: string;
    playerName: string;
    playerImage: string;
    teamLogo: string;
    sport: 'basketball';
    type: 'points' | 'assists' | 'rebounds' | 'threes';
    count: number;
    value: number; // e.g. 25.5
    trend: 'over' | 'under';
    lastMatch: string;
    confidenceScore: number;
    description: string;
}

import { footballDataService } from './footballDataService';
import { basketballDataService } from './basketballDataService';
import { baseballDataService } from './baseballDataService';
import { nhlDataService } from './nhlDataService';

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

        console.log('🔄 Calculating NEW Real Streaks from SportsData...');
        try {
            // Priority: Football and Basketball (Main drivers)
            const [footballStreaks, basketballStreaks] = await Promise.allSettled([
                this.analyzeSportStreaks(TOP_FOOTBALL_LEAGUES.slice(0, 4), 'football'),
                this.analyzeSportStreaks(TOP_BASKETBALL_LEAGUES, 'basketball')
            ]);

            let realStreaks: Streak[] = [];

            // Extract successful results
            if (footballStreaks.status === 'fulfilled') {
                realStreaks.push(...footballStreaks.value);
            }
            if (basketballStreaks.status === 'fulfilled') {
                realStreaks.push(...basketballStreaks.value);
            }

            // If we have few real streaks, mix with smart mock data to "fill" the UI
            if (realStreaks.length < 6) {
                console.log('⚠️ Limited real streaks, adding mocks for better UX');
                const mocks = this.getMockStreaks();
                realStreaks = [...realStreaks, ...mocks.slice(0, Math.max(0, 8 - realStreaks.length))];
            }

            // If still empty (all APIs failed), use all mocks
            if (realStreaks.length === 0) {
                console.warn('⚠️ All streak APIs failed, using full mock data');
                realStreaks = this.getMockStreaks();
            }

            this.streaksCache = realStreaks.sort((a, b) => b.count - a.count);
            this.lastFetch = Date.now();

            console.log(`✅ Returning ${this.streaksCache.length} streaks (${realStreaks.filter(s => !s.id.startsWith('m-')).length} real, ${realStreaks.filter(s => s.id.startsWith('m-')).length} mock)`);
            return this.streaksCache;
        } catch (error) {
            console.error('❌ Critical error in getStreaks, using mocks', error);
            const mocks = this.getMockStreaks();
            this.streaksCache = mocks;
            this.lastFetch = Date.now();
            return mocks;
        }
    }

    async getPlayerStreaks(): Promise<PlayerStreak[]> {
        // In a real scenario, this would analyze last 5 games for every player.
        // For now, we return curated "Burning Hot" trends for major stars.
        return [
            {
                id: 'p-streak-1',
                playerName: 'Luka Dončić',
                playerImage: 'https://api.sofascore.app/api/v1/player/829211/image',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3411/image', // Mavs
                sport: 'basketball',
                type: 'points',
                count: 5,
                value: 32.5,
                trend: 'over',
                lastMatch: '39 PTS vs PHX',
                confidenceScore: 9.6,
                description: 'Ha superado 32.5 puntos en sus últimos 5 partidos consecutivos.'
            },
            {
                id: 'p-streak-2',
                playerName: 'Nikola Jokić',
                playerImage: 'https://api.sofascore.app/api/v1/player/345229/image',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3415/image', // Nuggets
                sport: 'basketball',
                type: 'assists',
                count: 7,
                value: 9.5,
                trend: 'over',
                lastMatch: '12 AST vs MIL',
                confidenceScore: 9.4,
                description: 'El Joker promedia 11.2 asistencias en la última semana.'
            },
            {
                id: 'p-streak-3',
                playerName: 'Stephen Curry',
                playerImage: 'https://api.sofascore.app/api/v1/player/353272/image',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3428/image', // Warriors
                sport: 'basketball',
                type: 'threes',
                count: 4,
                value: 4.5,
                trend: 'over',
                lastMatch: '6 3PM vs LAC',
                confidenceScore: 9.2,
                description: 'Lluvia de triples: 4+ triples en 4 juegos seguidos.'
            },
            {
                id: 'p-streak-4',
                playerName: 'Giannis Antetokounmpo',
                playerImage: 'https://api.sofascore.app/api/v1/player/354569/image',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3416/image', // Bucks
                sport: 'basketball',
                type: 'rebounds',
                count: 6,
                value: 11.5,
                trend: 'over',
                lastMatch: '14 REB vs BOS',
                confidenceScore: 8.9,
                description: 'Dominio en la pintura: 6 dobles-dobles consecutivos.'
            }
        ];
    }

    private getMockStreaks(): Streak[] {
        return [
            {
                id: 'm-streak-1',
                teamName: 'Manchester City',
                teamLogo: 'https://api.sofascore.app/api/v1/team/17/image',
                sport: 'football',
                type: 'win',
                count: 8,
                league: 'Premier League',
                lastMatch: '3-0 vs Everton',
                confidenceScore: 9.5
            },
            {
                id: 'm-streak-2',
                teamName: 'Boston Celtics',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3422/image',
                sport: 'basketball',
                type: 'win',
                count: 6,
                league: 'NBA',
                lastMatch: '112-104 vs Miami',
                confidenceScore: 8.8
            },
            {
                id: 'm-streak-3',
                teamName: 'Bayer Leverkusen',
                teamLogo: 'https://api.sofascore.app/api/v1/team/2681/image',
                sport: 'football',
                type: 'win',
                count: 12,
                league: 'Bundesliga',
                lastMatch: '2-1 vs Bayern',
                confidenceScore: 9.8
            },
            {
                id: 'm-streak-4',
                teamName: 'Real Madrid',
                teamLogo: 'https://api.sofascore.app/api/v1/team/2829/image',
                sport: 'football',
                type: 'win',
                count: 4,
                league: 'La Liga',
                lastMatch: '4-1 vs Valencia',
                confidenceScore: 8.2
            },
            {
                id: 'm-streak-5',
                teamName: 'Golden State Warriors',
                teamLogo: 'https://api.sofascore.app/api/v1/team/3428/image',
                sport: 'basketball',
                type: 'win',
                count: 5,
                league: 'NBA',
                lastMatch: '128-110 vs Lakers',
                confidenceScore: 7.9
            },
            {
                id: 'm-streak-6',
                teamName: 'Liverpool',
                teamLogo: 'https://api.sofascore.app/api/v1/team/44/image',
                sport: 'football',
                type: 'win',
                count: 7,
                league: 'Premier League',
                lastMatch: '2-0 vs Arsenal',
                confidenceScore: 9.0
            }
        ];
    }

    private async analyzeSportStreaks(leagues: { name: string; id: number }[], sport: 'football' | 'basketball' | 'baseball' | 'nhl'): Promise<Streak[]> {
        const streaks: Streak[] = [];

        const promises = leagues.map(async (league) => {
            try {
                // Determine which service to use
                let service;
                if (sport === 'football') {
                    service = footballDataService;
                } else if (sport === 'basketball') {
                    service = basketballDataService;
                } else if (sport === 'baseball') {
                    service = baseballDataService;
                } else if (sport === 'nhl') {
                    service = nhlDataService;
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
