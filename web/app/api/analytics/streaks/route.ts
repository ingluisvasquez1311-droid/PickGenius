import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streakService';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute at edge

export async function GET(request: NextRequest) {
    try {
        const streaks = await streakService.getStreaks();

        return NextResponse.json({
            success: true,
            data: streaks,
            count: streaks.length,
            source: 'analytics_engine'
        });
    } catch (error: any) {
        console.error('❌ Streak Analytics Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
