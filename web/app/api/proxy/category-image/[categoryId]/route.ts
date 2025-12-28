import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    const { categoryId } = await params;

    if (!categoryId) {
        return new NextResponse('Category ID required', { status: 400 });
    }

    const bridgeUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const isVercel = !!process.env.VERCEL;

    // --- PRIORITY 1: BRIDGE (TUNNEL) ---
    if (bridgeUrl && bridgeUrl.startsWith('http')) {
        const cleanBridgeUrl = bridgeUrl.trim().replace(/\/$/, "");
        const bridgeFetchUrl = `${cleanBridgeUrl}/api/proxy/category-image/${categoryId}`;

        try {
            console.log(`🔌 [Category Bridge] Routing to: ${bridgeFetchUrl}`);
            const bridgeResponse = await fetch(bridgeFetchUrl, {
                headers: {
                    'User-Agent': 'PickGenius-Proxy-Bot',
                    'ngrok-skip-browser-warning': 'true'
                },
                signal: AbortSignal.timeout(8000)
            });

            if (bridgeResponse.ok) {
                const buffer = await bridgeResponse.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': bridgeResponse.headers.get('Content-Type') || 'image/png',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
        } catch (err: any) {
            console.error(`❌ [Category Bridge] Logic failed: ${err.message}`);
        }
    }

    // --- PRIORITY 2: DIRECT STEALTH (FALLBACK) ---
    const primaryUrl = `https://api.sofascore.com/api/v1/category/${categoryId}/image`;
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=64&h=64&fit=contain&output=png&q=80`;

    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400, immutable'
                }
            });
        }
        return new NextResponse('Image not found', { status: 404 });
    } catch (error) {
        return new NextResponse('Error fetching image', { status: 404 });
    }
}