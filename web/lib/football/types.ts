export interface FootballTeam {
    id: number;
    name: string;
    crest: string;
}

export interface FootballMatch {
    id: number;
    competition: {
        id: number;
        name: string;
        emblem: string;
    };
    utcDate: string;
    status: string;
    homeTeam: FootballTeam;
    awayTeam: FootballTeam;
    score: {
        winner: string | null;
        duration: string;
        fullTime: {
            home: number | null;
            away: number | null;
        };
    };
}

export interface FootballDataProvider {
    name: string;
    getMatches(date: string): Promise<FootballMatch[]>;
}
