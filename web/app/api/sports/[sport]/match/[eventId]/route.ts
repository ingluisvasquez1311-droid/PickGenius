import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { MatchParamsSchema, validateParams } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sport: string; eventId: string }> }
) {
    try {
        const { sport, eventId } = await validateParams(params, MatchParamsSchema);

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
        if (error.name === 'ZodError') {
            return NextResponse.json({ success: false, error: 'Invalid parameters', details: error.errors }, { status: 400 });
        }
        console.error(`❌ Universal Match API Error:`, error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
