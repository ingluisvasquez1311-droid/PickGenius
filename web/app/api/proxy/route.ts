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

        const isImage = targetUrl.includes('/image/') ||
            targetUrl.includes('/player/') ||
            targetUrl.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);

        if (isImage) {
            const response = await sofafetch(targetUrl, { binary: true });
            const blob = await (response as Response).blob();
            const contentType = (response as Response).headers.get('content-type') || 'image/png';

            return new NextResponse(blob, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400',
                }
            });
        }

        const data = await sofafetch(targetUrl);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`[Proxy Bridge Error]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
