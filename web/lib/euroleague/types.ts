export interface EuroleagueGame {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    date: string;
    time: string;
    status: 'Scheduled' | 'Live' | 'Finished';
    round: string;
    venue?: string;
}

export interface EuroleagueDataProvider {
    name: string;
    getTodayGames(): Promise<EuroleagueGame[]>;
    getGamesByDateRange(startDate: Date, endDate: Date): Promise<EuroleagueGame[]>;
}
