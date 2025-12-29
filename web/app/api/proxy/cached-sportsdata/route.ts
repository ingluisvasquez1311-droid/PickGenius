import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// Cliente Redis
// Asegúrate de que Redis esté corriendo en tu máquina (puerto 6379 por defecto)
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    commandTimeout: 3000, // Timeout para no bloquear si Redis no está
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on('error', (err) => {
    console.error('⚠️ Redis Connection Error:', err.message);
});

interface CachedData {
    data: any;
    timestamp: string;
    ttl: number;
    source: string;
}

/**
 * RUTA: /api/proxy/cached-sportsdata
 * Lee datos exclusivamente del Cache de Redis.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const sport = searchParams.get('sport') || 'football';
    const dataType = searchParams.get('type') || 'live';
    const endpoint = searchParams.get('endpoint') || 'aiscore';

    // Clave de cache (debe coincidir con la generada por Python)
    // Formato Python: "sports_cache:{md5(endpoint:sport:type)}"
    const cacheKey = generateCacheKey(endpoint, sport, dataType);

    try {
        // Leer de Redis
        const cachedDataString = await redis.get(cacheKey);

        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString) as CachedData;

            // Calcular edad
            const ageSeconds = Math.floor((Date.now() - new Date(cachedData.timestamp).getTime()) / 1000);

            return NextResponse.json({
                success: true,
                source: 'cache',
                age_seconds: ageSeconds,
                data: cachedData.data // Estructura unificada
            });
        }

        // Cache MISS
        return NextResponse.json({
            success: false,
            error: 'Cache Miss',
            message: 'Data not yet available in cache. Background service is fetching it.',
            key: cacheKey
        }, { status: 404 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Redis Error',
            details: error.message
        }, { status: 500 });
    }
}

// Función auxiliar para generar la misma MD5 key que Python
function generateCacheKey(endpoint: string, sport: string, dataType: string): string {
    const crypto = require('crypto');
    const keyString = `${endpoint}_${sport}_${dataType}`;
    return `sports_cache:${crypto.createHash('md5').update(keyString).digest('hex')}`;
}

export async function POST(request: NextRequest) {
    // Endpoint para limpiar cache o ver stats
    const body = await request.json();

    if (body.action === 'stats') {
        const keys = await redis.keys('sports_cache:*');
        return NextResponse.json({ keys_count: keys.length, keys });
    }

    return NextResponse.json({ error: 'Invalid action' });
}
