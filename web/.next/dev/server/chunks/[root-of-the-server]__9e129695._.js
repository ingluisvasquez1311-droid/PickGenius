module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/web/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [middleware] (ecmascript)");
;
// Rate Limit Configurations
const RATELIMIT_CONFIGS = {
    general: {
        windowMs: 15 * 60 * 1000,
        max: 500,
        name: 'General API'
    },
    prediction: {
        windowMs: 60 * 60 * 1000,
        max: 50,
        name: 'AI Predictions'
    },
    search: {
        windowMs: 15 * 60 * 1000,
        max: 300,
        name: 'Search'
    },
    auth: {
        windowMs: 15 * 60 * 1000,
        max: 20,
        name: 'Authentication'
    }
};
// In-memory store for rate limiting
const ipCache = new Map();
function proxy(request) {
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // Only apply to API routes
    if (path.startsWith('/api/')) {
        // WHITELIST LOCALHOST: Bypass limits for local development
        // 'unknown' is often localhost in direct dev mode without proxy headers
        if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'unknown') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
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
            record = {
                count: 0,
                resetTime: now + config.windowMs
            };
        }
        record.count++;
        ipCache.set(storageKey, record);
        // Create Response
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
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
            return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
                success: false,
                error: `Se ha excedido el límite de solicitudes para ${config.name}.`,
                retryAfter: Math.ceil((record.resetTime - now) / 1000),
                message: limitKey === 'prediction' ? 'Actualiza a Premium para predicciones ilimitadas.' : 'Intenta más tarde.'
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        return response;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: '/api/:path*'
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9e129695._.js.map