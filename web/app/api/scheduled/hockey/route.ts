import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const data = await sofafetch(`https://api.sofascore.app/api/v1/sport/ice-hockey/scheduled-events/${today}`, {
            revalidate: 300
        });

        // Filter: Only notstarted matches
        if (data.events) {
            data.events = data.events.filter((e: any) => e.status.type === 'notstarted');
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
