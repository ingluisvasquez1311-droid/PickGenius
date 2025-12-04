const getApiUrl = () => {
    // Since we're now using Next.js API routes, we use relative paths
    // This works both in development and production on Netlify
    // Force relative paths for Next.js API routes
    return '';
};

export const API_URL = getApiUrl();

export async function getStatus() {
    try {
        const res = await fetch(`${API_URL}/api/status`, { cache: 'no-store' });
        return res.json();
    } catch (error) {
        console.error('Error fetching status:', error);
        return null;
    }
}

export async function getFootballStats(league?: string) {
    try {
        const url = league
            ? `${API_URL}/api/football/stats/${encodeURIComponent(league)}`
            : `${API_URL}/api/football/stats`;

        const res = await fetch(url, { cache: 'no-store' });
        return res.json();
    } catch (error) {
        console.error('Error fetching football stats:', error);
        return null;
    }
}

export async function getNBAGames() {
    try {
        const res = await fetch(`${API_URL}/api/nba/games`, { cache: 'no-store' });
        const data = await res.json();
        return data.success ? data.games : [];
    } catch (error) {
        console.error('Error fetching NBA games:', error);
        return [];
    }
}

// Mock data for development when backend is offline or empty
export const MOCK_MATCHES = [
    {
        id: '1',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        date: '2024-11-24T20:00:00',
        league: 'NBA',
        prediction: { pick: 'Lakers -5.5', confidence: 85 }
    },
    {
        id: '2',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        date: '2024-11-25T15:00:00',
        league: 'La Liga',
        prediction: { pick: 'Ambos Marcan', confidence: 78 }
    }
];
