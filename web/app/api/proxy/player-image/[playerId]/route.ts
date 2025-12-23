import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    const { playerId } = await params;

    if (!playerId) {
        return new NextResponse('Player ID required', { status: 400 });
    }

    // Use weserv.nl as a caching proxy to bypass hotlink protection
    // We try the two possible Sofascore image URLs
    const primaryUrl = `https://api.sofascore.app/api/v1/player/${playerId}/image`;
    const secondaryUrl = `https://www.sofascore.com/api/v1/player/${playerId}/image`;

    // Construct the weserv.nl URL. We pass the primary URL as the main source, and handle errors if it fails.
    // However, for simplicity and reliability, we will try to fetch the first valid one or redirect to weserv.nl
    // pointing to the most likely valid URL.

    // Weserv is very reliable. We'll point it to the api.sofascore.app domain which is usually the mobile API.
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=200&h=200&fit=cover&a=top&output=webp&q=80`;

    try {
        console.log(`🖼️ [Player Proxy] Fetching from: ${proxyUrl}`);
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // If the primary fails, try the secondary domain via weserv
            const fallbackProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(secondaryUrl)}&w=200&h=200&fit=cover&a=top&output=webp&q=80`;
            const fallbackResponse = await fetch(fallbackProxyUrl);

            if (fallbackResponse.ok) {
                const buffer = await fallbackResponse.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'image/webp',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
            return new NextResponse('Image not found', { status: 404 });
        }

        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=86400, immutable'
            }
        });

    } catch (error) {
        console.error('Error proxying player image:', error);
        return new NextResponse('Error fetching image', { status: 404 });
    }
}
