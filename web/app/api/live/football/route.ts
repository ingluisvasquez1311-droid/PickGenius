import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';
import { SofaScoreEventSchema } from '@/lib/validations/sofascore';

export async function GET() {
    try {
        console.log("⚽ Fetching Live Football Data (SIN CUOTAS - usando BetPlay)...");
        const rawData = await sofafetch('https://api.sofascore.com/api/v1/sport/football/events/live', {
            revalidate: 0
        });

        const events = rawData.events || [];

        // ODDS REMOVED: User gets odds from BetPlay JSON, not from Sofascore
        // Just validate and return the events as-is
        const finalEvents = events.map((e: any) => {
            try {
                return SofaScoreEventSchema.parse(e);
            } catch {
                return e; // Return raw if validation fails
            }
        });

        trackRequest(true);
        return NextResponse.json({ events: finalEvents });
    } catch (error) {
        console.error('❌ Error fetching live football:', error);
        return NextResponse.json({ events: [], error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
