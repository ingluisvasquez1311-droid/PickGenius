import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';
import { SofaScoreEventSchema, SofaScoreOddsSchema } from '@/lib/validations/sofascore';

export async function GET() {
    try {
        console.log("⚽ Fetching Live Football Data with Mass Odds...");
        const rawData = await sofafetch('https://api.sofascore.com/api/v1/sport/football/events/live', {
            revalidate: 0
        });

        const events = rawData.events || [];

        // Mass Odds Fetching (Selective to avoid too many requests)
        const eventsWithOdds = await Promise.all(events.slice(0, 20).map(async (rawEvent: any) => {
            try {
                // Validate event structure
                const event = SofaScoreEventSchema.parse(rawEvent);

                const rawOddsData = await sofafetch(`https://api.sofascore.com/api/v1/event/${event.id}/odds/1/all`);
                const oddsData = SofaScoreOddsSchema.parse(rawOddsData);

                const mainMarket = oddsData.markets?.find((m: any) => m.marketName === 'Full time' || m.marketName === 'Match winner');
                return {
                    ...event,
                    mainOdds: mainMarket ? mainMarket.choices : null
                };
            } catch (e) {
                console.warn(`[Validation Warning] Skipping malformed event or odds:`, e);
                return rawEvent;
            }
        }));

        // Merge and validate remaining events
        const remainingEvents = events.slice(20).map((e: any) => {
            try {
                return SofaScoreEventSchema.parse(e);
            } catch {
                return e;
            }
        });

        const finalEvents = [...eventsWithOdds, ...remainingEvents];

        trackRequest(true);
        return NextResponse.json({ events: finalEvents });
    } catch (error) {
        console.error('❌ Error fetching live football:', error);
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
