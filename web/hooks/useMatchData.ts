import { useQuery } from '@tanstack/react-query';

interface MatchDetails {
    id: number;
    homeTeam: any;
    awayTeam: any;
    homeScore: any;
    awayScore: any;
    status: any;
    tournament: any;
    startTimestamp: number;
}

// Fetch basic match details
async function fetchMatchDetails(sport: string, eventId: string) {
    const res = await fetch(`/api/sports/${sport}/match/${eventId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch match details');
    }
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch match details');
    }
    return data.data;
}

// Fetch best players / top performers
async function fetchBestPlayers(sport: string, eventId: string) {
    const res = await fetch(`/api/sports/${sport}/match/${eventId}/best-player`);
    if (!res.ok) {
        throw new Error('Failed to fetch best players');
    }
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch best players');
    }
    return data.data;
}

export function useMatchDetails(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match', sport, eventId],
        queryFn: () => fetchMatchDetails(sport, eventId),
        enabled: !!sport && !!eventId,
        // Refetch every 30 seconds for live games
        refetchInterval: (query) => {
            const status = query.state.data?.status?.type;
            return status === 'inprogress' ? 30000 : false;
        },
        staleTime: 10000, // Consider data fresh for 10 seconds
    });
}

export function useMatchBestPlayers(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match-players', sport, eventId],
        queryFn: () => fetchBestPlayers(sport, eventId),
        enabled: !!sport && !!eventId,
        staleTime: 60000, // Players stats update less frequently
    });
}
