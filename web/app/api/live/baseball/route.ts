import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';

export async function GET() {
    try {
        const data = await sofafetch('https://api.sofascore.com/api/v1/sport/baseball/events/live', {
            revalidate: 15
        });
        trackRequest(true);
        return NextResponse.json(data);
    } catch (error) {
        trackRequest(false, error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ events: [] }, { status: 500 });
    }
}
