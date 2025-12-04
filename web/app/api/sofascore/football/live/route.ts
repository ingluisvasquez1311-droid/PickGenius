import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export async function GET(request: NextRequest) {
    try {
        const result = await sofaScoreFootballService.getLiveEvents();

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: result.data?.events || [],
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
