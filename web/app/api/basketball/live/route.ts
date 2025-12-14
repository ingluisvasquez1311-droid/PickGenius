import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const result = await sofaScoreBasketballService.getLiveEvents();

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: result.data || [],
            count: Array.isArray(result.data) ? result.data.length : 0
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
