import { NextRequest, NextResponse } from 'next/server';
import { nbaSyncService } from '@/lib/services/nbaSyncService';

// To avoid timeouts, we use the Edge runtime if possible, 
// but firebase-admin requires Node.js runtime.
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (max for Vercel Pro, Hobby is lower)

export async function GET(request: NextRequest) {
    try {
        // 1. Verify Authentication (Vercel Cron Header)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('⏰ [Cron] Starting NBA Sync...');

        // 2. Run the sync
        const result = await nbaSyncService.syncCurrentSeason();

        if (result.success) {
            return NextResponse.json({
                message: 'NBA Sync completed successfully',
                processed: result.gamesProcessed
            });
        } else {
            return NextResponse.json({
                error: result.error
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('❌ [Cron Error]:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}