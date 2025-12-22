import { NextRequest, NextResponse } from 'next/server';
import { nbaSyncService } from '@/lib/services/nbaSyncService';
import { footballSyncService } from '@/lib/services/footballSyncService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        // Verify Cron Secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('⏰ [Cron Task] Starting Sports synchronization...');

        // Run both in parallel for efficiency
        const [nbaResult, footballResult] = await Promise.all([
            nbaSyncService.syncCurrentSeason(),
            footballSyncService.syncDailyFixtures()
        ]);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            nba: nbaResult,
            football: footballResult
        });

    } catch (error: any) {
        console.error('❌ [Cron Error]:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
