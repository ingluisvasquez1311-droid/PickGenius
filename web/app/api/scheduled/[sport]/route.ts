import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sport: string }> }
) {
    const { sport } = await params;

    // Calculate today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch(`https://api.sofascore.com/api/v1/sport/${sport}/scheduled-events/${today}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com',
                'Cache-Control': 'no-cache',
            },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!response.ok) {
            console.error(`Sofascore API error for ${sport} scheduled:`, response.status);
            return NextResponse.json({ events: [] }, { status: response.status });
        }

        const data = await response.json();

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
