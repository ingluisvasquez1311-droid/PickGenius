import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;

    if (!eventId) {
        return NextResponse.json({ success: false, error: 'Match ID is required' }, { status: 400 });
    }

    try {
        console.log(`🏀 [Legacy Bridge] Fetching Basketball Match Details for ID ${eventId}...`);

        // Use the universal service which handles ScraperAPI bypass
        const data = await sportsDataService.makeRequest(`/event/${eventId}`);

        if (!data) {
            console.error(`❌ Legacy Sofascore API Error: Match ${eventId} not found or 403`);
            return NextResponse.json({ success: false, error: 'Provider unavailable' }, { status: 503 });
        }

        return NextResponse.json({
            success: true,
            data: data.event || data
        });

    } catch (error: any) {
        console.error('❌ Legacy Basketball Match API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
