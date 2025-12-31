import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`https://api.sofascore.app/api/v1/sport/ice-hockey/scheduled-events/${today}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://www.sofascore.com',
                'Referer': 'https://www.sofascore.com/'
            },
            next: { revalidate: 300 }
        });

        const data = await res.json();

        // Filter: Only notstarted matches
        if (data.events) {
            data.events = data.events.filter((e: any) => e.status.type === 'notstarted');
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
