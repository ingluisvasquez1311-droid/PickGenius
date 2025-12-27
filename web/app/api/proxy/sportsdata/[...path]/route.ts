import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://api.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search;

        // 🚀 PUERTA TRASERA: Redirigimos al Bridge para usar tu IP Real
        const BRIDGE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const targetUrl = `${BRIDGE_URL}/api/proxy/sportsdata/${path}${query}`;

        console.log(`🔌 [Proxy Bridge] Routing through Home-IP: ${targetUrl}`);

        // Fetch through the bridge (Your home PC)
        const response = await fetch(targetUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true'
            }
        });

        const data = await response.json();

        // Determinar cache según el tipo de datos
        const isLive = path.includes('live');
        const cacheSeconds = isLive ? 30 : 600; // 30s para vivo, 10 min para programados/finalizados

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds / 2}`
            }
        });

    } catch (error: any) {
        console.error('❌ [Proxy Error]:', error.message);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch data',
                details: error.message
            },
            { status: 500 }
        );
    }
}