import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET() {
    const sports = ['football', 'basketball', 'tennis', 'baseball', 'hockey', 'american-football'];

    try {
        const counts = await Promise.all(sports.map(async (sport) => {
            try {
                const url = `https://api.sofascore.com/api/v1/sport/${sport}/events/live`;
                const data = await sofafetch(url, { revalidate: 30 });
                return { sport, count: data.events?.length || 0 };
            } catch (e) {
                return { sport, count: 0 };
            }
        }));

        const response: Record<string, number> = {};
        counts.forEach(item => {
            response[item.sport] = item.count;
        });

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
    }
}
