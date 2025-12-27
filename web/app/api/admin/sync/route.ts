import { NextRequest, NextResponse } from 'next/server';
import { batchSyncService } from '@/lib/services/batchSyncService';

export const maxDuration = 300; // 5 minutes max for sync

export async function POST(request: NextRequest) {
    try {
        const { sport, action } = await request.json().catch(() => ({}));

        // Basic "Admin-like" check - in prod use a secret header or auth
        // const authHeader = request.headers.get('x-admin-secret');
        // if (authHeader !== process.env.ADMIN_SECRET) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

        if (action === 'clean') {
            const deleted = await batchSyncService.cleanOldData();
            return NextResponse.json({ success: true, deleted, message: 'Cleaned old data' });
        }

        if (sport === 'all' || !sport) {
            // Trigger background sync for all (simplest way in serverless is await or fire-and-forget logic if platform supports)
            // We await here to return the result
            const results = await batchSyncService.syncAll();
            return NextResponse.json({ success: true, results });
        } else {
            const result = await batchSyncService.syncSport(sport);
            return NextResponse.json({ success: true, result });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
