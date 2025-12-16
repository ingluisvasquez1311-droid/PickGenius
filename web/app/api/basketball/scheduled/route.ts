import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

        const response = await sofaScoreBasketballService.getScheduledEvents(date);

        if (!response.success) {
            return NextResponse.json(response, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
