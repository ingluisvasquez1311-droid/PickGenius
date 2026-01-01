import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';
import { globalCache } from '@/services/cacheService';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    try {
        // Cache Key generation
        const cacheKey = `match_v1_${id}`;

        // Fetch using Cache Service (TTL 60 seconds)
        const combinedData = await globalCache.getOrFetch(cacheKey, async () => {
            const [eventRes, statsRes, lineupsRes, bestPlayersRes, oddsRes, h2hRes, incidentsRes] = await Promise.allSettled([
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/statistics`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/lineups`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/best-players`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/odds/1/all`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/h2h`),
                sofafetch(`https://api.sofascore.com/api/v1/event/${id}/incidents`)
            ]);

            const eventData = eventRes.status === 'fulfilled' ? eventRes.value : null;
            if (!eventData || !eventData.event) {
                throw new Error("Event not found");
            }

            const statsData = statsRes.status === 'fulfilled' ? statsRes.value : { statistics: [] };
            const lineupsData = lineupsRes.status === 'fulfilled' ? lineupsRes.value : { home: { players: [] }, away: { players: [] } };
            const bestPlayersData = bestPlayersRes.status === 'fulfilled' ? bestPlayersRes.value : { bestPlayers: {} };
            const oddsData = oddsRes.status === 'fulfilled' ? oddsRes.value : { markets: [] };
            const h2hData = h2hRes.status === 'fulfilled' ? h2hRes.value : { matches: [], teamStats: {} };
            const incidentsData = incidentsRes.status === 'fulfilled' ? incidentsRes.value : { incidents: [] };

            return {
                event: eventData.event,
                statistics: statsData.statistics || [],
                lineups: lineupsData,
                bestPlayers: bestPlayersData.bestPlayers || {},
                odds: oddsData.markets || [],
                h2h: h2hData,
                incidents: incidentsData.incidents || []
            };
        }, 60); // 60s TTL

        trackRequest(true);
        return NextResponse.json(combinedData);

    } catch (error) {
        trackRequest(false, error instanceof Error ? error.message : 'Internal Error');
        console.error("Error fetching match details:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
