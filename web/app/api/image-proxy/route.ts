import { NextRequest, NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
        return new NextResponse('Missing path parameter', { status: 400 });
    }

    const targetUrl = `https://api.sofascore.com/api/v1/${path}`;

    try {
        const response = await sofafetch(targetUrl, {
            binary: true,
            revalidate: 86400
        });

        if (!(response instanceof Response)) {
            console.error(`[ImageProxy] sofafetch did not return a Response instance for ${targetUrl}`);
            return new NextResponse('Internal Error', { status: 502 });
        }

        if (!response.ok) {
            console.error(`[ImageProxy] Failed to fetch ${targetUrl}: ${response.status}`);
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error: any) {
        console.error(`[ImageProxy] Error fetching ${targetUrl}:`, error.message);
        // Relay 404 or other status if found in message
        const status = error.message?.includes('404') ? 404 : 500;
        return new NextResponse(error.message || 'Internal Server Error', { status });
    }
}
