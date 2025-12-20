import { NextRequest, NextResponse } from 'next/server';
import { sofascoreService } from '@/lib/services/sofascoreService';

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

        // Fetch details from Sofascore Service (Handles ScraperAPI proxy)
        const data = await sofascoreService.makeRequest(`/event/${eventId}`);

        if (!data) {
            console.error(`❌ Sofascore Error (${sport}): Provider unavailable or 403`);
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
