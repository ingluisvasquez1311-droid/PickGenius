import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    const { teamId } = await params;

    if (!teamId) {
        return new NextResponse('Team ID required', { status: 400 });
    }

    try {
        // Try multiple sources for team logos
        const primaryUrl = `https://api.sofascore.com/api/v1/team/${teamId}/image`;
        const secondaryUrl = `https://www.sofascore.com/api/v1/team/${teamId}/image`;

        // Use weserv.nl as a caching proxy to bypass hotlink protection
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=200&h=200&fit=contain&output=png&q=80`;

        console.log(`🖼️ [Logo Proxy] Fetching from: ${proxyUrl}`);
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // If primary fails via weserv, try secondary domain
            const fallbackProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(secondaryUrl)}&w=200&h=200&fit=contain&output=png&q=80`;
            const fallbackResponse = await fetch(fallbackProxyUrl);

            if (fallbackResponse.ok) {
                const buffer = await fallbackResponse.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
            return new NextResponse('Image not found', { status: 404 });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, immutable' // Cache for 24 hours
            }
        });

    } catch (error) {
        console.error('Error proxying team logo:', error);

        // Return transparent PNG on error
        // Return 404 on error to trigger frontend fallback (Initials)
        return new NextResponse('Error fetching image', { status: 404 });
    }
}
