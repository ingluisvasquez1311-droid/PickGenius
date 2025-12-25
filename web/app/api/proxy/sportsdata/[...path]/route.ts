import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://api.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search;
        const targetUrl = `${BASE_URL}/${path}${query}`;

        console.log(`🔌 [Proxy] Direct fetch: ${path}`);

        // Direct fetch - works perfectly from local PC
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.sofascore.com',
                'Referer': 'https://www.sofascore.com/'
            },
            next: {
                revalidate: path.includes('live') ? 30 : 300
            }
        });

        if (!response.ok) {
            throw new Error(`Sofascore API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('❌ [Proxy Error]:', error.message);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch data',
                details: error.message
            },
            { status: 500 }
        );
    }
}
