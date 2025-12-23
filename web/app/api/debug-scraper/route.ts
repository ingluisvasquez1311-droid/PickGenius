import { NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/scraperService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        SCRAPER_API_KEYS: process.env.SCRAPER_API_KEYS || null,
        SCRAPER_API_KEY: process.env.SCRAPER_API_KEY || null,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
        NODE_ENV: process.env.NODE_ENV,
    };

    const testUrl = 'https://www.sofascore.com/api/v1/sport/football/events/live';
    let testResult = null;
    let testError = null;

    try {
        const start = Date.now();
        console.log(`🧪 [Debug] Testing connection to ${testUrl} with ${vars.SCRAPER_API_KEYS ? 'keys' : 'NO KEYS'}...`);
        const data = await scraperService.makeRequest(testUrl, {
            render: false,
            country_code: 'us',
            useCache: false
        });
        testResult = {
            success: true,
            latency: Date.now() - start,
            events_count: data?.events?.length || 0
        };
    } catch (e: any) {
        testError = e.message;
        console.error(`❌ [Debug] Test Failed:`, e.message);
    }

    // Add Connection Test Results to diagnostics
    const diagnostics = {
        timestamp: new Date().toISOString(),
        connection_test: {
            url: testUrl,
            success: !testError,
            error: testError,
            details: testResult
        },
        keys_status: {
            SCRAPER_API_KEYS: {
                present: !!vars.SCRAPER_API_KEYS,
                length: vars.SCRAPER_API_KEYS ? vars.SCRAPER_API_KEYS.length : 0,
                preview: vars.SCRAPER_API_KEYS ? `${vars.SCRAPER_API_KEYS.substring(0, 5)}...` : 'N/A'
            },
            SCRAPER_API_KEY: {
                present: !!vars.SCRAPER_API_KEY,
                length: vars.SCRAPER_API_KEY ? vars.SCRAPER_API_KEY.length : 0
            }
        },
        env_dump: {
            has_api_url: !!vars.NEXT_PUBLIC_API_URL,
            api_url: vars.NEXT_PUBLIC_API_URL,
            node_env: vars.NODE_ENV
        }
    };

    return NextResponse.json(diagnostics, { status: 200 });
}
