import { NextRequest, NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/scraperService';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search;
        // Construct target URL for ScraperService
        // Note: scraperService.makeRequest expects the full URL
        const targetUrl = `${BASE_URL}/${path}${query}`;

        console.log(`🔌 [Proxy Route] Handling request for: ${path}`);
        console.log(`🔑 [Proxy Route] Using ScraperService with ${scraperService.getKeysDebugInfo().length} keys`);

        // Use ScraperService to handle the request (Rotator, Caching, Stealth Headers included)
        // This will automatically respect USE_DIRECT_FETCH or fall back to ScraperAPI keys
        const data = await scraperService.makeRequest(targetUrl, {
            useCache: !path.includes('live'), // Disable cache for live events
            cacheTTL: path.includes('live') ? 30 : 300 // Short TTL for live
        });

        // ScraperService throws if it fails, so if we are here, it worked.
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('❌ [Proxy Route Error]:', error.message);

        // Return structured error so frontend handles it gracefully
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch data from provider',
                details: error.message
            },
            { status: 500 }
        );
    }
}
