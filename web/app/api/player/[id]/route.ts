import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Extract numerical ID if slug is present (e.g. "12345-lebron-james" -> "12345")
    const numericId = id.split('-')[0];

    try {
        const [playerRes, matchesRes] = await Promise.allSettled([
            sofafetch(`https://api.sofascore.com/api/v1/player/${numericId}`),
            sofafetch(`https://api.sofascore.com/api/v1/player/${numericId}/events/last/0`)
        ]);

        const player = playerRes.status === 'fulfilled' ? playerRes.value?.player : null;
        const lastEvents = matchesRes.status === 'fulfilled' ? matchesRes.value?.events : [];

        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        // Fetch player statistics for each of the last matches (up to 10)
        const eventsToFetch = lastEvents.slice(0, 10);
        const statsPromises = eventsToFetch.map((event: any) =>
            sofafetch(`https://api.sofascore.com/api/v1/event/${event.id}/player/${numericId}/statistics`)
                .catch(() => null) // If stats fail, return null
        );

        const statsResults = await Promise.all(statsPromises);

        // Merge stats with events
        const enrichedMatches = eventsToFetch.map((event: any, idx: number) => ({
            ...event,
            playerStats: statsResults[idx]?.statistics || null
        }));

        return NextResponse.json({
            player,
            lastMatches: enrichedMatches
        });

    } catch (error) {
        console.error("Player API Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
