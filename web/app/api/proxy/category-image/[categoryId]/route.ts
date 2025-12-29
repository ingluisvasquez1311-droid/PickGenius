import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    const { categoryId } = await params;

    if (!categoryId || categoryId === 'undefined') {
        return new NextResponse('Invalid Category ID', { status: 400 });
    }

    try {
        const primaryUrl = `https://api.sofascore.app/api/v1/category/${categoryId}/image`;
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=100&h=100&fit=contain&output=png&q=80`;

        const response = await fetch(proxyUrl);
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400, immutable'
                }
            });
        }
    } catch (e) { }

    return new NextResponse('Not found', { status: 404 });
}