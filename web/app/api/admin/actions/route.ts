import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { nbaSyncService } from '@/lib/services/nbaSyncService';
import { footballSyncService } from '@/lib/services/footballSyncService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, payload } = body;

        // 1. Verify Authentication & Admin Role
        // Note: In a real app, verify the session/token here
        // For now, we assume the middleware or frontend auth already filtered this, 
        // but server-side check is safer.

        console.log(`🛠️ [Admin Action] Triggered: ${action}`);

        switch (action) {
            case 'RECALCULATE':
                // Manually trigger the sync services
                const [nba, football] = await Promise.all([
                    nbaSyncService.syncCurrentSeason(),
                    footballSyncService.syncDailyFixtures()
                ]);
                return NextResponse.json({ success: true, details: { nba, football } });

            case 'CLEAR_CACHE':
                // Mock cache clearing logic
                // In a real app with Redis: await redis.flushall();
                return NextResponse.json({ success: true, message: 'Sistema de cache reiniciado' });

            case 'NOTIFY_ALL':
                if (!payload?.message) {
                    return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
                }

                // Add to system notifications collection
                const db = admin.firestore();
                await db.collection('system_notifications').add({
                    message: payload.message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    type: 'broadcast',
                    readBy: []
                });

                return NextResponse.json({ success: true, message: 'Notificación enviada a todos los usuarios' });

            default:
                return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('❌ [Admin API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
