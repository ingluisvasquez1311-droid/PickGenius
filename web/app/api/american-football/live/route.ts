import { NextResponse } from 'next/server';
import FirebaseReadService from '@/lib/FirebaseReadService';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

try {
    initializeFirebaseAdmin();
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const startTime = Date.now();
    const SPORT_ID = 'american-football';
    const TYPE = 'live';

    try {
        const firebaseService = new FirebaseReadService();
        const hasRecentData = await firebaseService.hasRecentData(SPORT_ID, TYPE);

        if (!hasRecentData) {
            console.warn(`⚠️ No recent data for ${SPORT_ID} ${TYPE}, triggering background sync`);
            fetch(`http://localhost:3001/api/admin/sync/${SPORT_ID}`, { method: 'POST' })
                .catch(err => console.error('Sync trigger failed:', err));
        }

        const games = await firebaseService.getLiveGames(SPORT_ID);
        const duration = Date.now() - startTime;

        return NextResponse.json(games, {
            headers: {
                'X-Response-Time': `${duration}ms`,
                'X-Data-Source': 'firebase'
            }
        });

    } catch (error) {
        console.error(`❌ Error in ${SPORT_ID} ${TYPE} route:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
