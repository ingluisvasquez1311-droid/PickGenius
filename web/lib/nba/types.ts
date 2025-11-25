export interface NBAGame {
    id: string;
    gameId: number;
    date: Date;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: 'Scheduled' | 'Live' | 'Finished';
    season: string;
}

export interface NBADataProvider {
    name: string;
    getTodayGames(): Promise<NBAGame[]>;
    getGamesByDateRange(startDate: Date, endDate: Date): Promise<NBAGame[]>;
}
