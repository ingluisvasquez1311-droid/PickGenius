import { NextRequest, NextResponse } from 'next/server';
import { batchSyncService } from '@/lib/services/batchSyncService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (Serverless limit)

export async function GET(request: NextRequest) {
    try {
        // Verify Cron Secret (Allow dev mode bypass for manual testing)
        const authHeader = request.headers.get('authorization');
        const isDev = process.env.NODE_ENV === 'development';
        const isValidSecret = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

        if (!isDev && !isValidSecret) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('🤖 [Cron Robot] Starting FULL BATCH synchronization...');

        // Execute the "Robot" -> Sync All Sports (Fetch + Enrich + AI + Store)
        const results = await batchSyncService.syncAll();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results: results
        });

    } catch (error: any) {
        console.error('❌ [Cron Robot Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
