(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__06468e3d._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/web/app/api/proxy/category-image/[categoryId]/route.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/esm/api/server.js [app-edge-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/esm/server/web/exports/index.js [app-edge-route] (ecmascript)");
;
const runtime = 'edge';
async function GET(request, { params }) {
    const { categoryId } = await params;
    if (!categoryId) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Category ID required', {
            status: 400
        });
    }
    const bridgeUrl = ("TURBOPACK compile-time value", "http://localhost:3001") || 'http://localhost:3001';
    const isVercel = !!process.env.VERCEL;
    // --- PRIORITY 1: BRIDGE (TUNNEL) ---
    if (bridgeUrl && bridgeUrl.startsWith('http')) {
        const cleanBridgeUrl = bridgeUrl.trim().replace(/\/$/, "");
        const bridgeFetchUrl = `${cleanBridgeUrl}/api/proxy/category-image/${categoryId}`;
        try {
            console.log(`🔌 [Category Bridge] Routing to: ${bridgeFetchUrl}`);
            const bridgeResponse = await fetch(bridgeFetchUrl, {
                headers: {
                    'User-Agent': 'PickGenius-Proxy-Bot',
                    'ngrok-skip-browser-warning': 'true'
                },
                signal: AbortSignal.timeout(8000)
            });
            if (bridgeResponse.ok) {
                const buffer = await bridgeResponse.arrayBuffer();
                return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
                    headers: {
                        'Content-Type': bridgeResponse.headers.get('Content-Type') || 'image/png',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
        } catch (err) {
            console.error(`❌ [Category Bridge] Logic failed: ${err.message}`);
        }
    }
    // --- PRIORITY 2: DIRECT STEALTH (FALLBACK) ---
    const primaryUrl = `https://api.sofascore.com/api/v1/category/${categoryId}/image`;
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(primaryUrl)}&w=64&h=64&fit=contain&output=png&q=80`;
    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400, immutable'
                }
            });
        }
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Image not found', {
            status: 404
        });
    } catch (error) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Error fetching image', {
            status: 404
        });
    }
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__06468e3d._.js.map