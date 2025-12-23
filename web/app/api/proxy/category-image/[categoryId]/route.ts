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

    // Try multiple sources for category images (flags)
    const primaryUrl = `https://api.sofascore.com/api/v1/category/${categoryId}/image`;
    const secondaryUrl = `https://www.sofascore.com/api/v1/category/${categoryId}/image`;

    // Use weserv.nl as a caching proxy to bypass hotlink protection
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=64&h=64&fit=contain&output=png&q=80`;

    try {
        console.log(`🖼️ [Category Proxy] Fetching from: ${proxyUrl}`);
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // If primary via weserv fails, try secondary
            const fallbackProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(secondaryUrl)}&w=64&h=64&fit=contain&output=png&q=80`;
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

        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400, immutable'
            }
        });

    } catch (error) {
        console.error('Error proxying category image:', error);
        return new NextResponse('Error fetching image', { status: 404 });
    }
}
