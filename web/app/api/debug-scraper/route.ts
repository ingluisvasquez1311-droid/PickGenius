import { NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/scraperService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toISOString().split('T')[1]}] ${msg}`);

    try {
        log('🚀 Starting Scraper Debug...');

        // 1. Env Check
        const keys = process.env.SCRAPER_API_KEYS || '';
        log(`🔑 Keys loaded: ${keys.split(',').length} (Raw length: ${keys.length})`);

        // 2. Test Connection
        const testUrl = 'https://www.sofascore.com/api/v1/sport/football/events/live';
        log(`🌍 Fetching: ${testUrl}`);

        const start = Date.now();
        const data = await scraperService.makeRequest(testUrl, {
            render: false,
            country_code: 'us',
            useCache: false
        });
        const duration = Date.now() - start;

        if (data && data.events) {
            log(`✅ Success! Found ${data.events.length} events in ${duration}ms`);
            return NextResponse.json({
                success: true,
                logs,
                data_preview: {
                    events_count: data.events.length,
                    first_event: data.events[0] ? data.events[0].tournament.name : 'None'
                }
            });
        } else {
            log('⚠️ Request succeeded but returned no events or invalid structure');
            return NextResponse.json({ success: false, logs, data });
        }

    } catch (error: any) {
        log(`❌ ERROR: ${error.message}`);
        if (error.cause) log(`❓ Cause: ${JSON.stringify(error.cause)}`);

        return NextResponse.json({
            success: false,
            error: error.message,
            logs
        }, { status: 500 });
    }
}
