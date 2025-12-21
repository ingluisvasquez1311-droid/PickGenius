import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for demo purposes
// In production with multiple instances, use Redis (upstash/ratelimit)
const rateLimitMap = new Map();

interface RateLimitData {
    count: number;
    lastReset: number;
}

const LIMIT = 60; // 60 requests
const WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip) as RateLimitData | undefined;

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return false;
    }

    if (now - record.lastReset > WINDOW) {
        record.count = 1;
        record.lastReset = now;
        return false;
    }

    if (record.count >= LIMIT) {
        return true;
    }

    record.count += 1;
    return false;
}

export function proxy(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const path = request.nextUrl.pathname;

    // Only rate limit API routes, exclude static assets
    if (path.startsWith('/api')) {
        if (isRateLimited(ip)) {
            return new NextResponse(JSON.stringify({ success: false, error: 'Too many requests' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
