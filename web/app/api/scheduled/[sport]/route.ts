import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sport: string }> }
) {
    const { sport } = await params;

    // Calculate today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    try {
        const data = await sofafetch(`https://api.sofascore.com/api/v1/sport/${sport}/scheduled-events/${today}`, {
            revalidate: 60
        });

        // Filter: Keep only events that are NOT started yet.
        // Sofascore status.code: 0 = Not Started, 100 = Ended, 6/7 = Live
        // We can filter by status.type === 'notstarted' or checks timestamps
        const upcomingEvents = (data.events || []).filter((event: any) => {
            return event.status.type === 'notstarted';
        });

        // Sort by start time (earliest first)
        upcomingEvents.sort((a: any, b: any) => a.startTimestamp - b.startTimestamp);

        return NextResponse.json({ events: upcomingEvents });

    } catch (error) {
        console.error(`Error fetching scheduled ${sport}:`, error);
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
