import { NextResponse } from 'next/server';
import { firebaseReadService } from '@/lib/FirebaseReadService';
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
    const TYPE = 'scheduled';

    try {
        
        const hasRecentData = await firebaseReadService.hasRecentData(SPORT_ID, TYPE);

        if (!hasRecentData) {
            console.warn(`⚠️ No recent data for ${SPORT_ID} ${TYPE}, triggering background sync`);
            fetch(`http://localhost:3001/api/trigger/sofascore`, { method: 'POST' })
                .catch(err => console.error('Sync trigger failed:', err));
        }

        const games = await firebaseReadService.getScheduledGames(SPORT_ID);
        const duration = Date.now() - startTime;

        return NextResponse.json({ events: games }, {
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