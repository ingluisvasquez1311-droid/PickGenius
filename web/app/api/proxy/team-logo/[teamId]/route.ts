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
        const tertiaryUrl = `https://api.sofascore.app/api/v1/team/${teamId}/image`;

        // Use weserv.nl as a caching proxy to bypass hotlink protection
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=200&h=200&fit=contain&output=png&q=80`;

        console.log(`🖼️ [Logo Proxy] Fetching from: ${proxyUrl}`);

        try {
            const response = await fetch(proxyUrl, { next: { revalidate: 86400 } });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
        } catch (e) {
            console.warn(`[Logo Proxy] Weserv failed for ${teamId}, trying direct...`);
        }

        // Fallback 1: Direct URL from .com
        console.log(`📡 [Logo Proxy] Fallback 1 (Direct) for ${teamId}`);
        const directRes = await fetch(secondaryUrl, { next: { revalidate: 3600 } });
        if (directRes.ok) {
            const buffer = await directRes.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        // Fallback 2: Direct URL from .app
        console.log(`📡 [Logo Proxy] Fallback 2 (.app) for ${teamId}`);
        const appRes = await fetch(tertiaryUrl, { next: { revalidate: 3600 } });
        if (appRes.ok) {
            const buffer = await appRes.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        return new NextResponse('Image not found', { status: 404 });
    } catch (error) {
        console.error('Error proxying team logo:', error);
        return new NextResponse('Error fetching image', { status: 404 });
    }
}
