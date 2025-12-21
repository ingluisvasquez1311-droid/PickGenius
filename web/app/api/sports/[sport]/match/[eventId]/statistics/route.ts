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

        console.log(`🌐 [Statistics API] Fetching ${sport} Stats for ID ${eventId}...`);

        const data = await sportsDataService.getMatchStatistics(parseInt(eventId));

        if (!data) {
            console.warn(`⚠️ No statistics found for match ${eventId}`);
            return NextResponse.json({ success: true, data: { statistics: [] } });
        }

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ success: false, error: 'Invalid parameters', details: error.errors }, { status: 400 });
        }
        console.error(`❌ Statistics API Error:`, error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
