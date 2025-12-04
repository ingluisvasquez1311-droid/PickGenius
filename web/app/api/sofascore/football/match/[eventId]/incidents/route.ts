import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const { eventId } = params;
        const result = await sofaScoreFootballService.getIncidents(eventId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
