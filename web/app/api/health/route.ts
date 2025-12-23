import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const useProxyEnv = process.env.USE_PROXY;
    const isProxyEnabled = useProxyEnv === 'true' || useProxyEnv === '1';

    return NextResponse.json({
        status: 'ok',
        message: 'Health Check',
        timestamp: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            use_proxy_value: useProxyEnv,
            use_proxy_enabled: isProxyEnabled,
            has_firebase: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
            has_scraper_keys: !!process.env.SCRAPER_API_KEYS,
            has_scraper_key_single: !!process.env.SCRAPER_API_KEY
        }
    });
}
