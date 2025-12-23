import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const useProxyEnv = process.env.USE_PROXY;
    const isProxyEnabled = useProxyEnv === 'true' || useProxyEnv === '1';

    // Debug Keys Parsing
    const rawKeys = process.env.SCRAPER_API_KEYS || '';
    const singleKey = process.env.SCRAPER_API_KEY || '';

    const parsedKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 5);
    if (singleKey && !parsedKeys.includes(singleKey.trim())) {
        parsedKeys.push(singleKey.trim());
    }

    return NextResponse.json({
        status: 'ok',
        message: 'Health & Config Check',
        env: {
            use_proxy: isProxyEnabled,
            proxy_raw: useProxyEnv,
            scraper_keys_count: parsedKeys.length,
            // Show first 4 chars of first key to check for quotes/garbage
            first_key_preview: parsedKeys.length > 0 ? `${parsedKeys[0].substring(0, 4)}...` : 'NONE',
            firebase_configured: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        }
    });
}
