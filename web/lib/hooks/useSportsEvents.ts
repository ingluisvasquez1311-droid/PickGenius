import { useQuery } from '@tanstack/react-query';
import { sportsDataService } from '../services/sportsDataService';

export type SportType = 'football' | 'basketball' | 'tennis' | 'nhl' | 'nfl' | 'american-football' | 'baseball' | 'ice-hockey';

export function useSportsEvents(sport: SportType) {
    return useQuery({
        queryKey: ['events', sport],
        queryFn: async () => {
            return await sportsDataService.getEventsBySport(sport);
        },
        refetchInterval: 60 * 1000, // Refetch every 60 seconds
        staleTime: 30 * 1000,      // Stale after 30 seconds
    });
}
