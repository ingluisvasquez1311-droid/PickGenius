import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';

// Configuración de Redis para verificar caché antes de salir a internet
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    commandTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

const SOFASCORE_BASE_URL = 'https://api.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search;

        console.log(`🔍 [SportsData Proxy] Requesting: ${path}${query}`);

        // --- PRIORIDAD 1: DIRECTO A SOFASCORE CON HEADERS DE SIGILO ---
        // Intentamos obtener los datos directamente para asegurar frescura (Estadísticas, Alineaciones, etc)
        const targetUrl = `${SOFASCORE_BASE_URL}/${path}${query}`;

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://www.sofascore.com',
                    'Referer': 'https://www.sofascore.com/',
                    'Accept': '*/*',
                    'Accept-Language': 'es-ES,es;q=0.9'
                },
                next: { revalidate: path.includes('live') ? 15 : 300 }
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15'
                    }
                });
            }
        } catch (fetchErr) {
            console.error(`⚠️ [SportsData Proxy] Direct fetch failed for ${path}, trying Redis fallback...`);
        }

        // --- PRIORIDAD 2: FALLBACK REDIS (Si el scraper lo guardó) ---
        // Esto es útil para los listados de live/scheduled que ya tenemos en cache
        const isLive = path.includes('live');
        const isScheduled = path.includes('scheduled');

        if (isLive || isScheduled) {
            // Intentar reconstruir la llave que usa el Python scraper
            // Nota: Esto es complejo porque depende del hashing, pero podemos intentar buscar por patrones
            // O simplemente servir el error 404 si falló el directo, ya que SportsDataService 
            // ya hace sus propios fallbacks a las rutas /api/sport/live
        }

        return NextResponse.json(
            { success: false, error: 'Data not available directly' },
            { status: 404 }
        );

    } catch (error: any) {
        console.error('❌ [Proxy Error]:', error.message);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch data', details: error.message },
            { status: 500 }
        );
    }
}