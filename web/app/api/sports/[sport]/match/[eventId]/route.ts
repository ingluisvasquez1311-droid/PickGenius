import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

        // Fetch details from SportsData Service (Handles ScraperAPI proxy)
        const data = await sportsDataService.makeRequest(`/event/${eventId}`);

        if (!data) {
            console.error(`❌ SportsData Error (${sport}): Provider unavailable or 403`);
            return NextResponse.json({ success: false, error: 'Provider unavailable' }, { status: 503 });
        }

        return NextResponse.json({
            success: true,
            data: data.event
        });

    } catch (error: any) {
        console.error(`❌ Universal Match API Error (${sport}):`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
