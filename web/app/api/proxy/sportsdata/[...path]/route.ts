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
        const isVercel = !!process.env.VERCEL;

        // --- PRIORITY 1: BRIDGE (TUNNEL) ---
        // ONLY route through bridge if we are on Vercel. 
        // This prevents the local PC from trying to tunnel to itself recursively.
        if (isVercel && bridgeUrl && bridgeUrl.startsWith('http')) {
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

        // --- PRIORITY 2: DIRECT STEALTH (FALLBACK / LOCAL ROLE) ---
        // This is the part that will actually make the request to Sofascore from the "Home IP"
        console.log(`🕵️ [Proxy Stealth] Mimicking Browser for: ${path}`);

        // Determine Cache TTL based on path
        let revalidate = 60;
        if (path.includes('/events/live')) revalidate = 30;

        const directUrl = `https://api.sofascore.com/api/v1/${path}${query}`;

        // Advanced Stealth Headers to look like a real browser session
        const stealthHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Pragma': 'no-cache'
        };

        const response = await fetch(directUrl, {
            headers: stealthHeaders,
            next: { revalidate },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "Unknown error");
            console.error(`❌ [Proxy Stealth] Sofascore returned ${response.status} for ${path}`);
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
