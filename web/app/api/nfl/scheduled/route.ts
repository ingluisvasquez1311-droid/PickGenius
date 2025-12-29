import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { firebaseReadService } from '@/lib/FirebaseReadService';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    commandTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

try {
    initializeFirebaseAdmin();
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SOFASCORE_API = 'https://api.sofascore.com/api/v1';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const SPORT = 'nfl';
    const TYPE = 'scheduled';
    const ENDPOINT = 'aiscore';
    const crypto = require('crypto');

    try {
        // --- PRIORIDAD 1: DIRECTO SOFASCORE ---
        try {
            // Nota: SofaScore usa 'american-football'
            const directUrl = `${SOFASCORE_API}/sport/american-football/scheduled-events/${date}`;
            const directRes = await fetch(directUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://www.sofascore.com',
                    'Referer': 'https://www.sofascore.com/'
                }
            });

            if (directRes.ok) {
                const data = await directRes.json();
                if (data.events && data.events.length > 0) {
                    return NextResponse.json({ events: data.events }, {
                        headers: { 'X-Data-Source': 'sofascore-direct' }
                    });
                }
            }
        } catch (directErr) { }

        // --- PRIORIDAD 2: REDIS ---
        let keyString = `${ENDPOINT}_${SPORT}_${TYPE}`;
        let cacheKey = `sports_cache:${crypto.createHash('md5').update(keyString).digest('hex')}`;
        let cachedDataString = await redis.get(cacheKey);

        if (cachedDataString) {
            const cached = JSON.parse(cachedDataString);
            return NextResponse.json({ events: cached.data || [] }, {
                headers: {
                    'X-Data-Source': 'redis-cache',
                    'X-Cache-Timestamp': cached.timestamp
                }
            });
        }

        // --- PRIORIDAD 3: FIREBASE ---
        const firebaseEvents = await firebaseReadService.getScheduledGames(SPORT);
        return NextResponse.json({ events: firebaseEvents || [] }, {
            headers: { 'X-Data-Source': 'firebase-passive' }
        });

    } catch (error: any) {
        return NextResponse.json({ events: [] }, { status: 200 });
    }
}