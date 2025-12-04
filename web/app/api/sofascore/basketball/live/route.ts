import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';

export async function GET(request: NextRequest) {
    try {
        const result = await sofaScoreBasketballService.getLiveEvents();

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
