import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';

export async function GET() {
    try {
        console.log("🎾 Fetching Live Tennis Data with Mass Odds...");
        const data = await sofafetch('https://api.sofascore.app/api/v1/sport/tennis/events/live', {
            revalidate: 0
        });

        if (!data.events) {
            return NextResponse.json({ events: [] });
        }

        // Mass Odds Fetching (Selective)
        const eventsWithOdds = await Promise.all(data.events.slice(0, 20).map(async (event: any) => {
            try {
                // Tennis typically uses "Winner" as marketName
                const oddsData = await sofafetch(`https://api.sofascore.com/api/v1/event/${event.id}/odds/1/all`);
                const mainMarket = oddsData.markets?.find((m: any) => m.marketName === 'Winner');
                return {
                    ...event,
                    mainOdds: mainMarket ? mainMarket.choices : null
                };
            } catch (e) {
                return event;
            }
        }));

        const finalEvents = [...eventsWithOdds, ...data.events.slice(20)];

        trackRequest(true);
        return NextResponse.json({ events: finalEvents });
    } catch (error) {
        trackRequest(false, error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
