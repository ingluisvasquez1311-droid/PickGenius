import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search;
        const targetUrl = `${BASE_URL}/${path}${query}`;

        const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;

        // --- PRIORITY 1: BRIDGE (TUNNEL) ---
        if (bridgeUrl && bridgeUrl.startsWith('http')) {
            const cleanBridgeUrl = bridgeUrl.trim().replace(/\/$/, "");
            const bridgeFetchUrl = `${cleanBridgeUrl}/api/proxy/sportsdata/${path}${query}`;

            try {
                console.log(`🔌 [Proxy Bridge] Routing to: ${bridgeFetchUrl}`);
                const bridgeResponse = await fetch(bridgeFetchUrl, {
                    headers: {
                        'User-Agent': 'PickGenius-Proxy-Bot',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    cache: 'no-store',
                    signal: AbortSignal.timeout(8000)
                });

                if (bridgeResponse.ok) {
                    const data = await bridgeResponse.json();
                    return NextResponse.json(data);
                } else {
                    console.warn(`⚠️ [Proxy Bridge] Bridge error: ${bridgeResponse.status}`);
                }
            } catch (err: any) {
                console.error(`❌ [Proxy Bridge] Logic failed: ${err.message}`);
                // Fallback to direct
            }
        }

        // --- PRIORITY 2: DIRECT STEALTH (FALLBACK) ---
        console.log(`🕵️ [Proxy] Using Stealth Fallback for: ${path}`);

        // Determine Cache TTL based on path
        let revalidate = 60; // Default 1 min for proxy fallback
        if (path.includes('/events/live')) revalidate = 30;

        const directUrl = `https://api.sofascore.com/api/v1/${path}${query}`;

        const response = await fetch(directUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com',
                'Cache-Control': 'no-cache'
            },
            next: { revalidate },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "Unknown error");
            return NextResponse.json(
                { error: `Upstream error: ${response.status}`, details: errorBody.substring(0, 50) },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Proxy Route Error]:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
