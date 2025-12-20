import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = 'https://www.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sport: string; eventId: string }> }
) {
    const { sport, eventId } = await params;

    if (!eventId || !sport) {
        return NextResponse.json({ success: false, error: 'Sport and Match ID are required' }, { status: 400 });
    }

    try {
        console.log(`🌐 [Universal API] Fetching ${sport} Match Details for ID ${eventId}...`);

        // Fetch details from Sofascore (Server-side avoids CORS)
        const response = await fetch(`${BASE_URL}/event/${eventId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.sofascore.com/',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`❌ Sofascore Error (${sport}): ${response.status}`);
            return NextResponse.json({ success: false, error: 'Provider unavailable' }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data: data.event
        });

    } catch (error: any) {
        console.error(`❌ Universal Match API Error (${sport}):`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
