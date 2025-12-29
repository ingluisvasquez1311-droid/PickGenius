import { useQuery } from '@tanstack/react-query';
import { sportsDataService } from '@/lib/services/sportsDataService';

// Fetch basic match details
async function fetchMatchDetails(eventId: string) {
    // sportsDataService handles the API call and proxying
    const data = await sportsDataService.getEventById(eventId);
    if (!data) {
        throw new Error('Failed to fetch match details');
    }
    return data;
}

// Fetch best players / top performers
async function fetchBestPlayers(eventId: string) {
    const data = await sportsDataService.getMatchBestPlayers(Number(eventId));
    return data;
}

export function useMatchDetails(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match', sport, eventId],
        queryFn: () => fetchMatchDetails(eventId),
        enabled: !!eventId,
        // Refetch every 30 seconds for live games
        refetchInterval: (query) => {
            const status = query.state.data?.status?.type;
            return status === 'inprogress' ? 30000 : false;
        },
        staleTime: 10000,
    });
}

export function useMatchBestPlayers(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match-players', sport, eventId],
        queryFn: () => fetchBestPlayers(eventId),
        enabled: !!eventId,
        staleTime: 60000,
    });
}

async function fetchMatchStatistics(eventId: string) {
    const data = await sportsDataService.getMatchStatistics(Number(eventId));
    return data;
}

export function useMatchStatistics(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match-stats', sport, eventId],
        queryFn: () => fetchMatchStatistics(eventId),
        enabled: !!eventId,
        refetchInterval: (query) => {
            const status = query.state.data?.status?.type;
            return status === 'inprogress' ? 30000 : false;
        },
        staleTime: 20000,
    });
}

async function fetchMatchMomentum(eventId: string) {
    const data = await sportsDataService.getMatchMomentum(Number(eventId));
    // Check if valid momentum data exists
    if (!data || !data.graph) {
        // Return empty/null safely rather than throwing to avoid UI crashes
        return null;
    }
    return data;
}

export function useMatchMomentum(sport: string, eventId: string) {
    return useQuery({
        queryKey: ['match-momentum', sport, eventId],
        queryFn: () => fetchMatchMomentum(eventId),
        enabled: !!eventId,
        refetchInterval: (query) => {
            return 30000;
        },
        staleTime: 15000,
    });
}
