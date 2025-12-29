import { EuroleagueDataProvider, EuroleagueGame } from '../types';

export class MockEuroleagueProvider implements EuroleagueDataProvider {
    name = 'Mock Euroleague';

    async getTodayGames(): Promise<EuroleagueGame[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.getMockGames(today);
    }

    async getGamesByDateRange(startDate: Date, endDate: Date): Promise<EuroleagueGame[]> {
        // For mock, just return today's games
        return this.getTodayGames();
    }

    private getMockGames(date: string): EuroleagueGame[] {
        return [
            {
                id: 1,
                homeTeam: 'Real Madrid',
                awayTeam: 'Barcelona',
                homeScore: null,
                awayScore: null,
                date: date,
                time: '20:00',
                status: 'Scheduled',
                round: 'Round 12',
                venue: 'WiZink Center'
            },
            {
                id: 2,
                homeTeam: 'Olympiacos',
                awayTeam: 'Panathinaikos',
                homeScore: null,
                awayScore: null,
                date: date,
                time: '19:00',
                status: 'Scheduled',
                round: 'Round 12',
                venue: 'Peace and Friendship Stadium'
            },
            {
                id: 3,
                homeTeam: 'Fenerbahçe',
                awayTeam: 'Anadolu Efes',
                homeScore: null,
                awayScore: null,
                date: date,
                time: '18:30',
                status: 'Scheduled',
                round: 'Round 12',
                venue: 'Ülker Sports Arena'
            },
            {
                id: 4,
                homeTeam: 'CSKA Moscow',
                awayTeam: 'Zenit',
                homeScore: null,
                awayScore: null,
                date: date,
                time: '18:00',
                status: 'Scheduled',
                round: 'Round 12',
                venue: 'Megasport Arena'
            },
            {
                id: 5,
                homeTeam: 'Bayern Munich',
                awayTeam: 'ALBA Berlin',
                homeScore: null,
                awayScore: null,
                date: date,
                time: '20:30',
                status: 'Scheduled',
                round: 'Round 12',
                venue: 'Audi Dome'
            }
        ];
    }
}
