import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streakService';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute at edge

export async function GET(_request: NextRequest) {
    try {
        const [streaks, playerStreaks] = await Promise.all([
            streakService.getStreaks(),
            streakService.getPlayerStreaks()
        ]);

        return NextResponse.json({
            success: true,
            data: streaks,
            players: playerStreaks,
            count: streaks.length,
            source: 'analytics_engine'
        });
    } catch (error: unknown) {
        console.error('❌ Streak Analytics Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
