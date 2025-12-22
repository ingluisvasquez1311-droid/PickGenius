import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate Limit Configurations
const RATELIMIT_CONFIGS: Record<string, { windowMs: number; max: number; name: string }> = {
    general: { windowMs: 15 * 60 * 1000, max: 500, name: 'General API' }, // Increased limit for dev
    prediction: { windowMs: 60 * 60 * 1000, max: 50, name: 'AI Predictions' },
    search: { windowMs: 15 * 60 * 1000, max: 300, name: 'Search' },
    auth: { windowMs: 15 * 60 * 1000, max: 20, name: 'Authentication' },
};

// In-memory store for rate limiting
const ipCache = new Map<string, { count: number; resetTime: number }>();

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Only apply to API routes
    if (path.startsWith('/api/')) {
        // WHITELIST LOCALHOST: Bypass limits for local development
        // 'unknown' is often localhost in direct dev mode without proxy headers
        if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'unknown') {
            return NextResponse.next();
        }

        // Determine which limiter to use based on path
        let limitKey = 'general';
        if (path.includes('/predict')) limitKey = 'prediction';
        else if (path.includes('/search')) limitKey = 'search';
        else if (path.includes('/auth') || path.includes('/login') || path.includes('/register')) limitKey = 'auth';

        const config = RATELIMIT_CONFIGS[limitKey];
        const storageKey = `${limitKey}:${ip}`; // Unique key per limiter + IP
        const now = Date.now();

        let record = ipCache.get(storageKey);

        // Initialize or Reset if window passed
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + config.windowMs };
        }

        record.count++;
        ipCache.set(storageKey, record);

        // Create Response
        const response = NextResponse.next();

        // Rate Limit Headers
        response.headers.set('X-RateLimit-Limit', config.max.toString());
        response.headers.set('X-RateLimit-Remaining', Math.max(0, config.max - record.count).toString());
        response.headers.set('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());

        // Security Headers (Best practice)
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Check Limit
        if (record.count > config.max) {
            console.warn(`🚨 Rate Limit Exceeded [${config.name}] for IP: ${ip}`);

            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: `Se ha excedido el límite de solicitudes para ${config.name}.`,
                    retryAfter: Math.ceil((record.resetTime - now) / 1000),
                    message: limitKey === 'prediction' ? 'Actualiza a Premium para predicciones ilimitadas.' : 'Intenta más tarde.'
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
