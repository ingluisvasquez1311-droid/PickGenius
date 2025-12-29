import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SOFASCORE_API = 'https://api.sofascore.com/api/v1';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        console.log(`🚀 [TEST MODE] Fetching basketball scheduled for ${date} DIRECTLY from SofaScore`);

        const directUrl = `${SOFASCORE_API}/sport/basketball/scheduled-events/${date}`;
        const directRes = await fetch(directUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Origin': 'https://www.sofascore.com',
                'Referer': 'https://www.sofascore.com/'
            }
        });

        if (directRes.ok) {
            const data = await directRes.json();
            return NextResponse.json({ events: data.events || [] }, {
                headers: { 'X-Data-Source': 'sofascore-direct' }
            });
        }

        return NextResponse.json({ error: 'SofaScore Direct Failed', events: [] }, { status: directRes.status });

    } catch (error: any) {
        return NextResponse.json({ error: 'Data Fetch Error' }, { status: 500 });
    }
}