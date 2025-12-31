import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';

export async function GET() {
    try {
        console.log("⚽ Fetching Live Football Data with Mass Odds...");
        const data = await sofafetch('https://api.sofascore.app/api/v1/sport/football/events/live', {
            revalidate: 0
        });

        if (!data.events) {
            return NextResponse.json({ events: [] });
        }

        // Mass Odds Fetching (Selective to avoid too many requests)
        // We only fetch odds for the first 20 events to keep performance stable
        const eventsWithOdds = await Promise.all(data.events.slice(0, 20).map(async (event: any) => {
            try {
                const oddsData = await sofafetch(`https://api.sofascore.com/api/v1/event/${event.id}/odds/1/all`);
                const mainMarket = oddsData.markets?.find((m: any) => m.marketName === 'Full time' || m.marketName === 'Match winner');
                return {
                    ...event,
                    mainOdds: mainMarket ? mainMarket.choices : null
                };
            } catch (e) {
                return event;
            }
        }));

        // Merge with remaining events
        const finalEvents = [...eventsWithOdds, ...data.events.slice(20)];

        trackRequest(true);
        return NextResponse.json({ events: finalEvents });
    } catch (error) {
        console.error('❌ Error fetching live football:', error);
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
