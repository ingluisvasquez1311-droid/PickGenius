import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    try {
        console.log(`[Proxy Bridge] Fetching: ${targetUrl}`);

        const isImage = targetUrl.includes('/image') ||
            targetUrl.includes('/player/') ||
            targetUrl.includes('/team/') ||
            targetUrl.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)$/i);

        if (isImage) {
            const response = await sofafetch(targetUrl, { binary: true, skipBridge: true });

            if (!(response instanceof Response)) {
                return NextResponse.json({ error: 'Proxy received invalid response for image' }, { status: 502 });
            }

            const blob = await response.blob();
            const contentType = response.headers.get('content-type') || 'image/png';

            return new NextResponse(blob, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400',
                }
            });
        }

        const data = await sofafetch(targetUrl, { skipBridge: true });
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`[Proxy Bridge Error]:`, error.message);
        // Relay 404 if it originated from the external API, otherwise 500
        const status = error.message?.includes('404') ? 404 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
