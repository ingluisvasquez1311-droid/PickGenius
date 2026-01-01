import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';
import { SofaScoreEventSchema, SofaScoreOddsSchema } from '@/lib/validations/sofascore';

export async function GET() {
    try {
        console.log("🏀 Fetching Live Basketball Data with Mass Odds...");
        const rawData = await sofafetch('https://api.sofascore.app/api/v1/sport/basketball/events/live', {
            revalidate: 0
        });

        const events = rawData.events || [];

        // Mass Odds Fetching (Selective to avoid too many requests)
        const eventsWithOdds = await Promise.all(events.slice(0, 20).map(async (rawEvent: any) => {
            try {
                // Validate event structure
                const event = SofaScoreEventSchema.parse(rawEvent);

                // Basketball typically uses "Match winner" as marketName
                const rawOddsData = await sofafetch(`https://api.sofascore.com/api/v1/event/${event.id}/odds/1/all`);
                const oddsData = SofaScoreOddsSchema.parse(rawOddsData);

                const mainMarket = oddsData.markets?.find((m: any) => m.marketName === 'Match winner' || m.marketName === 'Full time');
                return {
                    ...event,
                    mainOdds: mainMarket ? mainMarket.choices : null
                };
            } catch (e) {
                console.warn(`[Validation Warning] Skipping malformed basketball event:`, e);
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
        trackRequest(false, error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
