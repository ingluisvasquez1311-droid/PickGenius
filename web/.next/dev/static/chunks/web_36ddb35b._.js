(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/web/lib/newsService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLatestNews",
    ()=>getLatestNews
]);
const MOCK_NEWS = [
    {
        id: '1',
        title: "Mbappé fuera de la convocatoria del Real Madrid por molestias",
        summary: "El astro francés no viajará a Sevilla. Ancelotti confirma rotaciones masivas pensando en Champions.",
        source: "Marca",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1628891565293-b8163f92f623?q=80&w=1000&auto=format&fit=crop",
        publishedAt: new Date().toISOString(),
        aiAnalysis: {
            sentiment: 'negative',
            bettingSignal: "📉 Real Madrid Win% baja un 12%. Valor en 'Empate' o Sevilla +0.5.",
            impactScore: 85
        }
    },
    {
        id: '2',
        title: "Lakers firman racha de 5 victorias con LeBron en modo MVP",
        summary: "Dominio absoluto en la pintura. Anthony Davis promedia 30 puntos en los últimos 3 juegos.",
        source: "ESPN",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1518407613690-d9fc996e726e?q=80&w=1000&auto=format&fit=crop",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        aiAnalysis: {
            sentiment: 'positive',
            bettingSignal: "🔥 Lakers cubrirán el spread (-4.5). Over de puntos de AD muy probable.",
            impactScore: 92
        }
    },
    {
        id: '3',
        title: "Manchester City: Haaland duda para el derby",
        summary: "Guardiola no asegura la presencia del noruego. Julián Álvarez podría ser titular.",
        source: "Bleacher Report",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1626025437642-0b05076ca301?q=80&w=1000&auto=format&fit=crop",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        aiAnalysis: {
            sentiment: 'neutral',
            bettingSignal: "⚠️ Evitar apuestas a 'Haaland Goleador'. Buscar valor en 'Ambos marcan'.",
            impactScore: 78
        }
    }
];
async function getLatestNews() {
    // Simulate API delay
    await new Promise((resolve)=>setTimeout(resolve, 800));
    return MOCK_NEWS;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/home/NewsSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$newsService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/newsService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function NewsSection() {
    _s();
    const [news, setNews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewsSection.useEffect": ()=>{
            const fetchNews = {
                "NewsSection.useEffect.fetchNews": async ()=>{
                    try {
                        // Fetch from our new internal API which handles RSS + AI
                        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/news/live');
                        if (result.success && Array.isArray(result.data)) {
                            setNews(result.data);
                        } else {
                            // Fallback to mock if API fails
                            const mockData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$newsService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLatestNews"])();
                            setNews(mockData);
                        }
                    } catch (error) {
                        console.error("Failed to fetch news", error);
                        // Fallback on error
                        const mockData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$newsService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLatestNews"])();
                        setNews(mockData);
                    } finally{
                        setLoading(false);
                    }
                }
            }["NewsSection.useEffect.fetchNews"];
            fetchNews();
            // Auto-refresh every 10 minutes
            const interval = setInterval(fetchNews, 600000);
            return ({
                "NewsSection.useEffect": ()=>clearInterval(interval)
            })["NewsSection.useEffect"];
        }
    }["NewsSection.useEffect"], []);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-12 border-t border-white/5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 w-1 bg-gray-700 rounded-full animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 46,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 w-64 bg-gray-800 rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 47,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/home/NewsSection.tsx",
                        lineNumber: 45,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: [
                            1,
                            2,
                            3
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-64 bg-[#111] rounded-xl border border-white/5 animate-pulse"
                            }, i, false, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 51,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/web/components/home/NewsSection.tsx",
                        lineNumber: 49,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/home/NewsSection.tsx",
                lineNumber: 44,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/home/NewsSection.tsx",
            lineNumber: 43,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-12 border-t border-white/5 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"
            }, void 0, false, {
                fileName: "[project]/web/components/home/NewsSection.tsx",
                lineNumber: 62,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 w-1 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"
                            }, void 0, false, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 66,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white",
                                children: [
                                    "Radar ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600",
                                        children: "Info-Betting"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/home/NewsSection.tsx",
                                        lineNumber: 68,
                                        columnNumber: 31
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 67,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30 animate-pulse",
                                children: "LIVE FEED"
                            }, void 0, false, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/home/NewsSection.tsx",
                        lineNumber: 65,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: news.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: item.url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "group relative bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.05)] cursor-pointer block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-40 relative overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                lineNumber: 86,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: item.imageUrl,
                                                alt: item.title,
                                                className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                lineNumber: 87,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-2 right-2 z-20 bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-300",
                                                children: item.source
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                lineNumber: 92,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/home/NewsSection.tsx",
                                        lineNumber: 85,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-5 relative z-20 -mt-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-bold text-white leading-tight mb-2 group-hover:text-green-400 transition-colors",
                                                children: item.title
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                lineNumber: 98,
                                                columnNumber: 33
                                            }, this),
                                            item.aiAnalysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-white/5 border border-white/10 rounded-lg p-3 mt-3 backdrop-blur-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1",
                                                                children: "👾 AI Insight"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                                lineNumber: 106,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${item.aiAnalysis.impactScore > 80 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`,
                                                                children: [
                                                                    "Impacto: ",
                                                                    item.aiAnalysis.impactScore,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                                lineNumber: 109,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/home/NewsSection.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-300 font-medium leading-relaxed border-l-2 border-purple-500 pl-2",
                                                        children: item.aiAnalysis.bettingSignal
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/home/NewsSection.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                                lineNumber: 104,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/home/NewsSection.tsx",
                                        lineNumber: 97,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, item.id, true, {
                                fileName: "[project]/web/components/home/NewsSection.tsx",
                                lineNumber: 77,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/web/components/home/NewsSection.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/home/NewsSection.tsx",
                lineNumber: 64,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/home/NewsSection.tsx",
        lineNumber: 60,
        columnNumber: 9
    }, this);
}
_s(NewsSection, "F6yDZrO2rMZs5jzX1Q2MMfiqj9g=");
_c = NewsSection;
var _c;
__turbopack_context__.k.register(_c, "NewsSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/home/SportsGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SportsGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
'use client';
;
;
;
const sports = [
    {
        id: 'tennis',
        name: 'Tenis',
        icon: '🎾',
        href: '/tennis',
        color: 'bg-green-500'
    },
    {
        id: 'nfl',
        name: 'NFL',
        icon: '🏈',
        href: '/american-football',
        color: 'bg-orange-900'
    },
    {
        id: 'baseball',
        name: 'Béisbol',
        icon: '⚾',
        href: '/baseball',
        color: 'bg-red-400'
    },
    {
        id: 'nhl',
        name: 'Hockey',
        icon: '🏒',
        href: '/nhl',
        color: 'bg-blue-400'
    }
];
function SportsGrid({ liveStats = {} }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-20 bg-black/50 border-t border-white/5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 mb-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "h-px w-12 bg-purple-500"
                        }, void 0, false, {
                            fileName: "[project]/web/components/home/SportsGrid.tsx",
                            lineNumber: 23,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-3xl font-black uppercase italic tracking-tighter",
                            children: "Más Deportes"
                        }, void 0, false, {
                            fileName: "[project]/web/components/home/SportsGrid.tsx",
                            lineNumber: 24,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/home/SportsGrid.tsx",
                    lineNumber: 22,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 md:grid-cols-4 gap-6",
                    children: sports.map((sport)=>{
                        const count = liveStats[sport.id] || 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: sport.href,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                whileHover: {
                                    scale: 1.05,
                                    y: -5
                                },
                                whileTap: {
                                    scale: 0.95
                                },
                                className: "glass-card p-8 text-center group cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all bg-white/[0.02] rounded-[2.5rem] relative",
                                children: [
                                    count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-6 right-6 flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/home/SportsGrid.tsx",
                                                lineNumber: 39,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-black text-red-500",
                                                children: [
                                                    count,
                                                    " LIVE"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/home/SportsGrid.tsx",
                                                lineNumber: 40,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/home/SportsGrid.tsx",
                                        lineNumber: 38,
                                        columnNumber: 41
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-16 h-16 ${sport.color}/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`,
                                        children: sport.icon
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/home/SportsGrid.tsx",
                                        lineNumber: 43,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-black uppercase tracking-widest text-[10px] text-gray-400 group-hover:text-white transition-colors",
                                        children: sport.name
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/home/SportsGrid.tsx",
                                        lineNumber: 46,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 text-[9px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest",
                                        children: "Explorar →"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/home/SportsGrid.tsx",
                                        lineNumber: 49,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/home/SportsGrid.tsx",
                                lineNumber: 32,
                                columnNumber: 33
                            }, this)
                        }, sport.id, false, {
                            fileName: "[project]/web/components/home/SportsGrid.tsx",
                            lineNumber: 31,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/web/components/home/SportsGrid.tsx",
                    lineNumber: 27,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/home/SportsGrid.tsx",
            lineNumber: 21,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/web/components/home/SportsGrid.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
_c = SportsGrid;
var _c;
__turbopack_context__.k.register(_c, "SportsGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/lib/services/sportsDataService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sportsDataService",
    ()=>sportsDataService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
// La URL del Bridge (Tu IP casera) es obligatoria para NO ser bloqueados
const BRIDGE_URL = ("TURBOPACK compile-time value", "http://localhost:3001") || 'http://localhost:3001';
const BASE_URL = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" // En el servidor, USAMOS EL PUENTE (Tu IP) siempre
 : '/api/proxy/sportsdata'; // En el cliente, usamos el proxy local del navegador
;
/**
 * Servicio para obtener datos deportivos
 */ class SportsDataService {
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    };
    /**
     * Generic method to make requests
     * Using fetchAPI for centralized URL and error handling
     */ async makeRequest(endpoint) {
        try {
            const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
            const proxyEndpoint = `/api/proxy/sportsdata${cleanEndpoint}`;
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(proxyEndpoint, {
                headers: this.headers
            });
        } catch (error) {
            // Silence 404s as they are often expected (e.g., no momentum or no lineups for small leagues)
            const errorMsg = error.message || '';
            const is404 = errorMsg.includes('404') || error.status === 404 || error.response?.status === 404;
            if (!is404) {
                console.error(`❌ [SportsDataService] Request failed for ${endpoint}:`, errorMsg);
            } else {
            // console.warn(`[SportsDataService] Data not found (404) for ${endpoint} - This is often expected.`);
            }
            return null;
        }
    }
    /**
     * Obtiene partidos de fútbol en vivo
     */ /**
     * Obtiene partidos de fútbol en vivo
     */ async getLiveFootballMatches() {
        try {
            // 1. Prioridad: Sofascore DIRECTO (vía Bridge) para inmediatez absoluta
            const data = await this.makeRequest('/sport/football/events/live');
            if (data?.events && data.events.length > 0) return data.events;
        } catch (e) {
            console.warn("⚠️ Fallback to Firebase for Live Football");
        }
        // 2. Fallback: Firebase (Vía nuestra API interna)
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/football/live', {
            headers: this.headers
        });
        return res?.events || [];
    }
    /**
     * Obtiene partidos de fútbol programados para una fecha
     */ async getScheduledFootballMatches(date) {
        return this.getScheduledEventsBySport('football', date);
    }
    /**
     * Obtiene eventos programados de forma filtrada (Backend Local)
     */ async getScheduledEventsBySport(sport, date) {
        const today = date || new Date().toISOString().split('T')[0];
        try {
            // 1. Prioridad: Sofascore DIRECTO (vía Bridge) - Lo que Daniel ve en su PC
            const ssData = await this.makeRequest(`/sport/${sport}/scheduled-events/${today}`);
            if (ssData?.events && ssData.events.length > 0) {
                return ssData.events;
            }
        } catch (e) {
            console.warn(`⚠️ SofaScore Direct failed for ${sport}, checking Firebase...`);
        }
        try {
            // 2. Fallback: Nuestra API de Firebase
            const queryParams = date ? `?date=${date}` : '';
            const endpoint = `/api/${sport}/scheduled${queryParams}`;
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(endpoint, {
                headers: this.headers
            });
            return result.events || result.data || [];
        } catch (error) {
            console.error(`❌ [SportsDataService] Error total fetching scheduled ${sport}:`, error);
            return [];
        }
    }
    /**
     * Obtiene todos los partidos de fútbol (en vivo + programados)
     */ async getAllFootballMatches(date) {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveMatches, scheduledMatches] = await Promise.all([
            this.getLiveFootballMatches(),
            this.getScheduledFootballMatches(today)
        ]);
        const allMatches = [
            ...liveMatches || [],
            ...scheduledMatches || []
        ];
        return allMatches.filter((match, index, self)=>index === self.findIndex((m)=>m.id === match.id));
    }
    /**
     * Obtiene partidos de baloncesto en vivo
     */ async getLiveBasketballGames() {
        try {
            // 1. Prioridad: Sofascore DIRECTO
            const data = await this.makeRequest('/sport/basketball/events/live');
            if (data?.events && data.events.length > 0) return data.events;
        } catch (e) {
            console.warn("⚠️ Fallback to Firebase for Live Basketball");
        }
        // 2. Fallback: Firebase
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/basketball/live', {
            headers: this.headers
        });
        return res?.events || [];
    }
    /**
     * Obtiene partidos de baloncesto programados para una fecha
     */ async getScheduledBasketballGames(date) {
        return this.getScheduledEventsBySport('basketball', date);
    }
    /**
     * Obtiene todos los partidos de baloncesto (en vivo + programados)
     */ async getAllBasketballGames(date) {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveGames, scheduledGames] = await Promise.all([
            this.getLiveBasketballGames(),
            this.getScheduledBasketballGames(today)
        ]);
        const allGames = [
            ...liveGames || [],
            ...scheduledGames || []
        ];
        return allGames.filter((game, index, self)=>index === self.findIndex((g)=>g.id === game.id));
    }
    /**
     * Filtra partidos de baloncesto por liga
     */ filterBasketballByLeague(games, league) {
        return games.filter((game)=>{
            const tournamentName = game.tournament.name.toLowerCase();
            const uniqueTournamentName = game.tournament.uniqueTournament?.name.toLowerCase() || '';
            if (league === 'NBA') {
                return tournamentName.includes('nba') || uniqueTournamentName.includes('nba');
            } else {
                return tournamentName.includes('euroleague') || uniqueTournamentName.includes('euroleague');
            }
        });
    }
    /**
     * Obtiene un evento específico por ID
     */ async getEventById(eventId) {
        try {
            // 1. PRIORIDAD ABSOLUTA: Sofascore DIRECTO (vía Bridge)
            // Esto garantiza que Momentum, Estadísticas y Alineaciones estén disponibles AL INSTANTE
            const ssData = await this.makeRequest(`/event/${eventId}`);
            if (ssData && ssData.event) {
                const event = ssData.event;
                // 2. ENRIQUECIMIENTO ASÍNCRONO: Intentar obtener cuotas/predicciones de Firebase
                try {
                    const firebaseRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(`/api/events/${eventId}`);
                    if (firebaseRes && firebaseRes.event) {
                        // Combinamos: Datos base de Sofascore + Lo que tengamos en nuestra DB (cuotas, verificaciones)
                        return {
                            ...event,
                            ...firebaseRes.event,
                            // Mantenemos los scores de Sofascore como fuente de verdad en vivo
                            homeScore: event.homeScore,
                            awayScore: event.awayScore,
                            status: event.status,
                            // Indicador de que fue enriquecido
                            isEnriched: true
                        };
                    }
                } catch (e) {
                // Si falla Firebase, devolvemos el evento puro de Sofascore sin problemas
                }
                return event;
            }
        } catch (error) {
            console.error(`❌ [SportsDataService] Error getting event ${eventId} from Bridge:`, error);
        }
        // 3. FALLBACK: Si el bridge falla o el evento no existe en Sofascore, intentar solo Firebase
        try {
            const firebaseRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(`/api/events/${eventId}`);
            return firebaseRes?.event || null;
        } catch (e) {
            return null;
        }
    }
    /**
     * Obtiene estadísticas detalladas de un evento
     */ async getMatchBestPlayers(eventId) {
        try {
            const data = await this.makeRequest(`/event/${eventId}/best-players`);
            // If data is valid and has expected structure, return it
            if (data && (data.bestPlayers || data.allPlayers)) {
                return data;
            }
            // Fallback: Try to derive best players from lineups/statistics
            // console.log(`🔍 [SportsData] No direct 'best-players' for ${eventId}, using lineups fallback...`);
            const lineups = await this.getMatchLineups(eventId);
            if (lineups && lineups.home && lineups.away) {
                const mapPlayers = (players = [])=>players.filter((p)=>p.statistics && (p.statistics.rating > 0 || p.statistics.points > 0)).sort((a, b)=>(b.statistics.rating || 0) - (a.statistics.rating || 0));
                const homePlayers = [
                    ...lineups.home.players || [],
                    ...lineups.home.bench || []
                ];
                const awayPlayers = [
                    ...lineups.away.players || [],
                    ...lineups.away.bench || []
                ];
                const processed = {
                    allPlayers: {
                        home: mapPlayers(homePlayers),
                        away: mapPlayers(awayPlayers)
                    },
                    bestPlayers: {
                        home: mapPlayers(homePlayers).slice(0, 3),
                        away: mapPlayers(awayPlayers).slice(0, 3)
                    },
                    source: 'lineups_derived'
                };
                return processed;
            }
            return {
                allPlayers: {
                    home: [],
                    away: []
                },
                bestPlayers: {
                    home: [],
                    away: []
                }
            };
        } catch (error) {
            console.error(`❌ [SportsData] Error getting best players for ${eventId}:`, error);
            return {
                allPlayers: {
                    home: [],
                    away: []
                },
                bestPlayers: {
                    home: [],
                    away: []
                }
            };
        }
    }
    async getMatchMomentum(eventId) {
        return await this.makeRequest(`/event/${eventId}/attack-momentum`);
    }
    /**
     * Obtiene estadísticas generales del partido (posesión, tiros, etc.)
     */ async getMatchStatistics(eventId) {
        return await this.makeRequest(`/event/${eventId}/statistics`);
    }
    /**
     * Obtiene cuotas reales de mercado (Bet365, etc.) para el partido
     */ async getMatchOdds(eventId, marketId = 1) {
        try {
            const data = await this.makeRequest(`/event/${eventId}/odds/${marketId}/all`);
            // The makeRequest already handles errors and returns null for failed requests.
            // We just need to check if the data is null or empty, which might indicate a 404 or no data.
            if (!data || Object.keys(data).length === 0) {
                console.warn(`[SportsData] Odds not available (or empty response) for event ${eventId}, market ${marketId}`);
                return null;
            }
            return data;
        } catch (error) {
            console.error(`[SportsData] Error fetching odds for ${eventId}:`, error);
            return null;
        }
    }
    /**
     * Intenta extraer la línea principal de Over/Under (Totales) de un evento
     */ async getMatchTotalLine(eventId, sport) {
        try {
            const odds = await this.getMatchOdds(eventId);
            if (!odds || !odds.markets) return null;
            // Diferentes nombres de mercado según el deporte
            const marketKeywords = sport === 'football' ? [
                'total goals',
                'over/under'
            ] : [
                'total points',
                'over/under',
                'total'
            ];
            const market = odds.markets.find((m)=>marketKeywords.some((key)=>m.marketName.toLowerCase().includes(key)));
            if (market && market.choices && market.choices.length > 0) {
                const choice = market.choices[0];
                const lineMatch = choice.name.match(/(\d+\.?\d*)/);
                if (lineMatch) {
                    return {
                        line: parseFloat(lineMatch[1]),
                        provider: 'Betplay'
                    };
                }
            }
            return null;
        } catch (error) {
            console.error(`Error al extraer línea total para ${eventId}:`, error);
            return null;
        }
    }
    /**
     * Obtiene alineaciones y estadísticas de jugadores del partido
     */ async getMatchLineups(eventId) {
        return await this.makeRequest(`/event/${eventId}/lineups`);
    }
    /**
     * Obtiene los jugadores de un equipo (plantilla)
     */ async getTeamPlayers(teamId) {
        return await this.makeRequest(`/team/${teamId}/players`);
    }
    /**
     * Obtiene los últimos partidos de un equipo
     */ async getTeamLastResults(teamId, sport = 'football') {
        const data = await this.makeRequest(`/team/${teamId}/events/last/0`);
        return data?.events || [];
    }
    /**
     * Obtiene el historial de enfrentamientos directos (H2H)
     */ async getMatchH2H(eventId) {
        return await this.makeRequest(`/event/${eventId}/h2h`);
    }
    /**
     * Obtiene estadísticas detalladas de un jugador en un partido específico
     */ async getPlayerEventStatistics(playerId, eventId) {
        return await this.makeRequest(`/event/${eventId}/player/${playerId}/statistics`);
    }
    /**
     * Obtiene los últimos eventos de un jugador
     */ async getPlayerLastEvents(playerId) {
        return await this.makeRequest(`/player/${playerId}/events/last/0`);
    }
    /**
     * Obtiene estadísticas de un jugador para una temporada
     */ async getPlayerSeasonStats(playerId, tournamentId, seasonId) {
        try {
            // Priority 1: Regular Season (Most common for NBA/leagues)
            const regularRes = await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/regularSeason`);
            if (regularRes && regularRes.statistics) return regularRes;
        } catch (e) {
        // Ignore 404s on regularSeason
        }
        try {
            // Priority 2: Overall (Fallback)
            const overallRes = await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`);
            if (overallRes && overallRes.statistics) return overallRes;
        } catch (e) {
            console.warn(`[SportsData] No season stats found for player ${playerId}`);
        }
        return {
            statistics: {}
        };
    }
    /**
     * Obtiene eventos para un deporte específico (en vivo + programados)
     * FILTERS OUT finished matches older than 2 hours
     * FILTERS OUT upcoming matches starting more than 12 hours from now
     */ async getEventsBySport(sport, date) {
        const today = date || new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];
        // 1. Obtener datos REAL-TIME directamente de Sofascore (vía Bridge)
        const [liveFromBridge, scheduledToday, scheduledTomorrow] = await Promise.all([
            this.makeRequest(`/sport/${sport}/events/live`).catch(()=>null),
            this.getScheduledEventsBySport(sport, today),
            this.getScheduledEventsBySport(sport, tomorrow)
        ]);
        const liveEvents = liveFromBridge?.events || [];
        const liveIds = new Set(liveEvents.map((e)=>e.id));
        // Filter out matches that are already LIVE from the scheduled lists
        const cleanToday = (Array.isArray(scheduledToday) ? scheduledToday : []).filter((e)=>!liveIds.has(e.id));
        const cleanTomorrow = (Array.isArray(scheduledTomorrow) ? scheduledTomorrow : []).filter((e)=>!liveIds.has(e.id));
        const allEvents = [
            ...liveEvents,
            ...cleanToday,
            ...cleanTomorrow
        ];
        // Final deduplication (just in case there's overlap between today and tomorrow or live)
        const uniqueEvents = allEvents.filter((event, index, self)=>index === self.findIndex((e)=>e.id === event.id));
        // Filter out old finished matches (older than 12 hours) AND future matches (more than 24 hours away)
        const now = Date.now() / 1000;
        const twelveHoursAgo = now - 12 * 60 * 60;
        const twentyFourHoursFromNow = now + 24 * 60 * 60;
        const recentEvents = uniqueEvents.filter((event)=>{
            if (event.status?.type === 'finished') {
                return event.startTimestamp > twelveHoursAgo;
            }
            if (event.status?.type === 'notstarted' || event.status?.type === 'scheduled') {
                return event.startTimestamp <= twentyFourHoursFromNow;
            }
            return true;
        });
        console.log(`📊 [${sport.toUpperCase()}] Filtered ${uniqueEvents.length} events → ${recentEvents.length} (deduplicated and windowed)`);
        return recentEvents;
    }
}
const sportsDataService = new SportsDataService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/rocket.js [app-client] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$home$2f$NewsSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/home/NewsSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$home$2f$SportsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/home/SportsGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/services/sportsDataService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
function HomePage() {
    _s();
    const [basketballStats, setBasketballStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        liveEvents: 0,
        loading: true
    });
    const [footballStats, setFootballStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        liveEvents: 0,
        loading: true
    });
    const [otherSportsStats, setOtherSportsStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [isRedirectingStripe, setIsRedirectingStripe] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            async function fetchStats() {
                try {
                    // --- BASKETBALL FETCH ---
                    // getEventsBySport now handles live + windowed scheduled
                    const basketballEvents = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('basketball');
                    const basketballLiveCount = basketballEvents.filter({
                        "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                    }["HomePage.useEffect.fetchStats"]).length;
                    const basketballFeatured = basketballEvents.length > 0 ? basketballEvents[0] : null;
                    setBasketballStats({
                        liveEvents: basketballLiveCount,
                        featuredMatch: basketballFeatured,
                        loading: false
                    });
                    // --- FOOTBALL FETCH ---
                    const footballEvents = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('football');
                    const footballLiveCount = footballEvents.filter({
                        "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                    }["HomePage.useEffect.fetchStats"]).length;
                    const footballFeatured = footballEvents.length > 0 ? footballEvents[0] : null;
                    setFootballStats({
                        liveEvents: footballLiveCount,
                        featuredMatch: footballFeatured,
                        loading: false
                    });
                    // --- OTHER SPORTS FETCH (Batch) ---
                    const [tennisEvents, baseballEvents, nhlEvents, nflEvents] = await Promise.all([
                        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('tennis'),
                        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('baseball'),
                        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('nhl'),
                        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport('nfl')
                    ]);
                    setOtherSportsStats({
                        tennis: tennisEvents.filter({
                            "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                        }["HomePage.useEffect.fetchStats"]).length,
                        baseball: baseballEvents.filter({
                            "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                        }["HomePage.useEffect.fetchStats"]).length,
                        nhl: nhlEvents.filter({
                            "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                        }["HomePage.useEffect.fetchStats"]).length,
                        nfl: nflEvents.filter({
                            "HomePage.useEffect.fetchStats": (e)=>e.status?.type === 'inprogress'
                        }["HomePage.useEffect.fetchStats"]).length
                    });
                } catch (error) {
                    console.error('Error fetching stats:', error);
                    setBasketballStats({
                        liveEvents: 0,
                        loading: false
                    });
                    setFootballStats({
                        liveEvents: 0,
                        loading: false
                    });
                }
            }
            fetchStats();
            const interval = setInterval(fetchStats, 60000);
            return ({
                "HomePage.useEffect": ()=>clearInterval(interval)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], []);
    const handleUpgrade = async ()=>{
        if (!user) {
            window.location.href = '/login';
            return;
        }
        setIsRedirectingStripe(true);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/stripe/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.uid,
                    email: user.email
                })
            });
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No se pudo obtener la URL de pago');
                setIsRedirectingStripe(false);
            }
        } catch (error) {
            console.error('Error al iniciar checkout:', error);
            setIsRedirectingStripe(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-8081c023982104e3" + " " + "min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-8081c023982104e3" + " " + "fixed inset-0 z-0 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-8081c023982104e3" + " " + "absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-slow-pulse"
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            animationDelay: '4s'
                        },
                        className: "jsx-8081c023982104e3" + " " + "absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-slow-pulse"
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-8081c023982104e3" + " " + "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/page.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-8081c023982104e3" + " " + "relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4 pt-48 pb-32 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    duration: 0.8
                                },
                                className: "inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black tracking-[0.3em] text-purple-400 mb-10 backdrop-blur-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-8081c023982104e3" + " " + "relative flex h-2 w-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8081c023982104e3" + " " + "animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 125,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8081c023982104e3" + " " + "relative inline-flex rounded-full h-2 w-2 bg-purple-500 shadow-[0_0_10px_purple]"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 126,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this),
                                    "INTELIGENCIA DEPORTIVA DE ÚLTIMA GENERACIÓN • ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-8081c023982104e3" + " " + "text-emerald-400 ml-1",
                                        children: "PRUEBA 15 DÍAS GRATIS"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 128,
                                        columnNumber: 59
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h1, {
                                initial: {
                                    opacity: 0,
                                    filter: 'blur(10px)'
                                },
                                animate: {
                                    opacity: 1,
                                    filter: 'blur(0px)'
                                },
                                transition: {
                                    duration: 1,
                                    delay: 0.2
                                },
                                className: "text-7xl md:text-[11rem] font-black mb-10 tracking-tighter leading-[0.8] uppercase italic",
                                children: [
                                    "DOMINA EL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                        className: "jsx-8081c023982104e3"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 137,
                                        columnNumber: 22
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-8081c023982104e3" + " " + "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-[200%_auto] animate-aurora",
                                        children: "JUEGO IA."
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    duration: 1,
                                    delay: 0.5
                                },
                                className: "text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-16 leading-tight font-medium tracking-tight",
                                children: [
                                    "PickGenius no adivina. Nuestros algoritmos analizan millones de datos por segundo para entregarte ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-8081c023982104e3" + " " + "text-white font-bold",
                                        children: "ventaja competitiva real"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 149,
                                        columnNumber: 111
                                    }, this),
                                    " en cada apuesta."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    duration: 0.8,
                                    delay: 0.8
                                },
                                className: "flex flex-col sm:flex-row gap-6 justify-center items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/props",
                                        className: "group relative px-12 py-6 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)] uppercase tracking-widest text-sm flex items-center gap-3",
                                        children: [
                                            "Lanzar Analizador IA ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"], {
                                                className: "w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 159,
                                                columnNumber: 36
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this),
                                    !user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        className: "px-12 py-6 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-md uppercase tracking-widest text-sm relative group overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8081c023982104e3" + " " + "relative z-10",
                                                children: "Reclamar 15 Días Premium Gratis ✨"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 163,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 164,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-8081c023982104e3" + " " + "w-full bg-white/[0.01] border-y border-white/5 py-8 mb-40 overflow-hidden relative group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none"
                            }, void 0, false, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "flex gap-16 animate-scroll whitespace-nowrap px-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-10 min-w-max",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 bg-orange-500/5 px-6 py-3 rounded-2xl border border-orange-500/10 backdrop-blur-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-orange-500 tracking-widest uppercase italic",
                                                    children: "🔥 PARLEY PRO"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-sm font-bold text-white/90",
                                                    children: "Lakers ML + Lebron James Over 25.5 Pts"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 178,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "flex items-center gap-1 text-xs font-black text-orange-400",
                                                    children: [
                                                        "92% CONF ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 103
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 179,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 176,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-10 min-w-max",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10 backdrop-blur-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-emerald-500 tracking-widest uppercase italic",
                                                    children: "💎 VALUE BET"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-sm font-bold text-white/90",
                                                    children: "Real Madrid vs Barcelona: Ambos Marcan (BTTS)"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 187,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "flex items-center gap-1 text-xs font-black text-emerald-400",
                                                    children: [
                                                        "88% PROB ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                            className: "w-3 h-3 fill-emerald-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 188,
                                                            columnNumber: 104
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 185,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-10 min-w-max",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 bg-blue-500/5 px-6 py-3 rounded-2xl border border-blue-500/10 backdrop-blur-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-blue-500 tracking-widest uppercase italic",
                                                    children: "🎾 ACE ALERT"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 195,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-sm font-bold text-white/90",
                                                    children: "Alcaraz 2nd Set Winner @ 1.85"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 196,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "flex items-center gap-1 text-xs font-black text-blue-400",
                                                    children: [
                                                        "LIVE ALPHA ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                            className: "w-3 h-3 fill-blue-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 197,
                                                            columnNumber: 103
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 197,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-10 min-w-max",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 bg-purple-500/5 px-6 py-3 rounded-2xl border border-purple-500/10 backdrop-blur-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-purple-500 tracking-widest uppercase italic",
                                                    children: "🚀 MOONSHOT"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-sm font-bold text-white/90",
                                                    children: "Man City Correct Score 3-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "flex items-center gap-1 text-xs font-black text-purple-400",
                                                    children: [
                                                        "CUOTA 12.0 ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                            className: "w-3 h-3 fill-purple-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 206,
                                                            columnNumber: 105
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 206,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 203,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-10 min-w-max",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 bg-orange-500/5 px-6 py-3 rounded-2xl border border-orange-500/10 backdrop-blur-md",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-orange-500 tracking-widest uppercase italic",
                                                    children: "🔥 PARLEY PRO"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 213,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-sm font-bold text-white/90",
                                                    children: "Lakers ML + Lebron James Over 25.5 Pts"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-8081c023982104e3" + " " + "flex items-center gap-1 text-xs font-black text-orange-400",
                                                    children: [
                                                        "92% CONF ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 103
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 212,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4 pb-48",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-8081c023982104e3" + " " + "grid grid-cols-1 md:grid-cols-3 gap-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/parley",
                                    className: "block outline-none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            y: -10
                                        },
                                        className: "glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                    className: "w-32 h-32"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-10 shadow-2xl shadow-purple-500/5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    className: "w-8 h-8 fill-purple-400/20"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 232,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-8081c023982104e3" + " " + "text-3xl font-black mb-6 uppercase tracking-tighter italic",
                                                children: "Criterio de Kelly (Parley)"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 235,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-8081c023982104e3" + " " + "text-gray-400 leading-tight text-lg",
                                                children: "Optimización matemática de tus apuestas combinadas. No solo multiplicamos cuotas, calculamos tu stake ideal para maximizar el crecimiento del capital."
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 236,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 225,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/app/page.tsx",
                                    lineNumber: 224,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/bankroll",
                                    className: "block outline-none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            y: -10
                                        },
                                        className: "glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                    className: "w-32 h-32"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 246,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 245,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-10 shadow-2xl shadow-blue-500/5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                    className: "w-8 h-8"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-8081c023982104e3" + " " + "text-3xl font-black mb-6 uppercase tracking-tighter italic",
                                                children: "Bankroll Terminal"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-8081c023982104e3" + " " + "text-gray-400 leading-tight text-lg",
                                                children: "Visualiza tu ROI, beneficio proyectado y distribución de riesgo por deporte. Una suite financiera profesional para el apostador disciplinado."
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 252,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/app/page.tsx",
                                    lineNumber: 240,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/football-live",
                                    className: "block outline-none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            y: -10
                                        },
                                        className: "glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                    className: "w-32 h-32"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 261,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-10 shadow-2xl shadow-emerald-500/5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    className: "w-8 h-8"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-8081c023982104e3" + " " + "text-3xl font-black mb-6 uppercase tracking-tighter italic",
                                                children: "Alpha de Tiempo Real"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 267,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-8081c023982104e3" + " " + "text-gray-400 leading-tight text-lg",
                                                children: 'Alertas de "Peligro Crítico" (Grito de Gol) basadas en momentum de ataque en vivo. Recibe notificaciones antes de que el mercado reaccione.'
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 268,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/app/page.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/app/page.tsx",
                            lineNumber: 223,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4 pb-48",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-8081c023982104e3" + " " + "bg-gradient-to-br from-[#0c0c0c] to-black rounded-[4rem] p-16 border border-white/5 relative overflow-hidden group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-8081c023982104e3" + " " + "absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"
                                }, void 0, false, {
                                    fileName: "[project]/web/app/page.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-8081c023982104e3" + " " + "relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-8081c023982104e3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8081c023982104e3" + " " + "inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-8",
                                                    children: "Ecosistema Profesional"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 281,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-6xl md:text-8xl font-black mb-12 uppercase italic tracking-tighter leading-none",
                                                    children: [
                                                        "LA TERMINAL",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                            className: "jsx-8081c023982104e3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 282,
                                                            columnNumber: 129
                                                        }, this),
                                                        "DETERMINISTA."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-8081c023982104e3" + " " + "text-xl text-gray-500 mb-12 max-w-lg leading-tight font-medium",
                                                    children: "Hemos diseñado un centro de control unificado. De la detección del valor en vivo a la gestión del capital, todo en un solo flujo de trabajo."
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8081c023982104e3" + " " + "grid grid-cols-1 md:grid-cols-2 gap-4 mb-12",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/bankroll",
                                                            className: "p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-8081c023982104e3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1",
                                                                            children: "Finanzas Pro"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/app/page.tsx",
                                                                            lineNumber: 291,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8081c023982104e3" + " " + "text-xl font-bold italic uppercase tracking-tighter",
                                                                            children: "Bankroll Hub"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/app/page.tsx",
                                                                            lineNumber: 292,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/app/page.tsx",
                                                                    lineNumber: 290,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                    className: "w-5 h-5 text-gray-600 group-hover:text-emerald-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/app/page.tsx",
                                                                    lineNumber: 294,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 289,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/parley",
                                                            className: "p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-8081c023982104e3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1",
                                                                            children: "Multiplicadores"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/app/page.tsx",
                                                                            lineNumber: 298,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-8081c023982104e3" + " " + "text-xl font-bold italic uppercase tracking-tighter",
                                                                            children: "Smart Parley"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/app/page.tsx",
                                                                            lineNumber: 299,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/app/page.tsx",
                                                                    lineNumber: 297,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                    className: "w-5 h-5 text-gray-600 group-hover:text-purple-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/app/page.tsx",
                                                                    lineNumber: 301,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 296,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 288,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/football-live",
                                                    className: "group flex items-center gap-4 text-white font-black uppercase text-sm tracking-[0.2em] hover:text-emerald-400 transition-colors",
                                                    children: [
                                                        "ENTRAR AL WAR ROOM ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                            className: "w-5 h-5 fill-white group-hover:fill-emerald-400 transition-all"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/page.tsx",
                                                            lineNumber: 306,
                                                            columnNumber: 38
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 280,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/football-live/${footballStats.featuredMatch?.id}`,
                                            className: "relative group/card block outline-none",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-8081c023982104e3" + " " + "absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                    mode: "wait",
                                                    children: footballStats.featuredMatch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            opacity: 0,
                                                            scale: 0.9,
                                                            x: 20
                                                        },
                                                        animate: {
                                                            opacity: 1,
                                                            scale: 1,
                                                            x: 0
                                                        },
                                                        exit: {
                                                            opacity: 0,
                                                            scale: 0.9,
                                                            x: -20
                                                        },
                                                        className: "glass-brutal p-12 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-3xl",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-8081c023982104e3" + " " + "absolute top-10 right-10 flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-8081c023982104e3" + " " + "w-2 h-2 rounded-full bg-red-500 animate-ping"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 323,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-8081c023982104e3" + " " + "text-[10px] font-black text-red-500 uppercase tracking-widest",
                                                                        children: "Live Momentum Control"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 324,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 322,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-8081c023982104e3" + " " + "text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8081c023982104e3" + " " + "text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] mb-12",
                                                                        children: footballStats.featuredMatch.tournament.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 328,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center justify-between gap-12",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-8081c023982104e3" + " " + "flex-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].img, {
                                                                                        whileHover: {
                                                                                            scale: 1.1,
                                                                                            rotate: 5
                                                                                        },
                                                                                        src: `/api/proxy/team-logo/${footballStats.featuredMatch.homeTeam.id}`,
                                                                                        className: "w-24 h-24 mx-auto mb-6 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                                                                                        alt: ""
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 332,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                        className: "jsx-8081c023982104e3" + " " + "font-black text-xl uppercase tracking-tighter",
                                                                                        children: footballStats.featuredMatch.homeTeam.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 338,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/app/page.tsx",
                                                                                lineNumber: 331,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-8081c023982104e3" + " " + "flex flex-col items-center",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "jsx-8081c023982104e3" + " " + "text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-700",
                                                                                        children: "VS"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 342,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "jsx-8081c023982104e3" + " " + "mt-4 px-4 py-2 bg-white/5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10",
                                                                                        children: new Date(footballStats.featuredMatch.startTimestamp * 1000).toLocaleTimeString([], {
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit'
                                                                                        })
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 343,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/app/page.tsx",
                                                                                lineNumber: 341,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-8081c023982104e3" + " " + "flex-1 text-center",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].img, {
                                                                                        whileHover: {
                                                                                            scale: 1.1,
                                                                                            rotate: -5
                                                                                        },
                                                                                        src: `/api/proxy/team-logo/${footballStats.featuredMatch.awayTeam.id}`,
                                                                                        className: "w-24 h-24 mx-auto mb-6 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                                                                                        alt: ""
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 349,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                        className: "jsx-8081c023982104e3" + " " + "font-black text-xl uppercase tracking-tighter",
                                                                                        children: footballStats.featuredMatch.awayTeam.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/app/page.tsx",
                                                                                        lineNumber: 355,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/app/page.tsx",
                                                                                lineNumber: 348,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 330,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 327,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-8081c023982104e3" + " " + "mt-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center group-hover/card:bg-emerald-500/20 transition-all",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8081c023982104e3" + " " + "text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-2",
                                                                        children: "PROYECCIÓN IA"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 361,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-8081c023982104e3" + " " + "text-2xl font-black italic uppercase tracking-tighter text-white",
                                                                        children: "PELIGRO CRÍTICO DETECTADO"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/app/page.tsx",
                                                                        lineNumber: 362,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 360,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, footballStats.featuredMatch.id, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/page.tsx",
                                            lineNumber: 311,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/app/page.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/app/page.tsx",
                            lineNumber: 276,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 275,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4 pb-48",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "text-center mb-24",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "jsx-8081c023982104e3" + " " + "text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 italic",
                                        children: "PLANES DE ÉXITO"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-8081c023982104e3" + " " + "text-gray-400 text-lg uppercase tracking-widest font-bold",
                                        children: "Escala tu rentabilidad con herramientas profesionales."
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 376,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 374,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            scale: 1.02
                                        },
                                        className: "p-12 bg-white/[0.01] rounded-[4rem] border border-white/5 hover:border-white/10 transition-all flex flex-col group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-8081c023982104e3" + " " + "text-3xl font-black mb-2 uppercase tracking-tight italic",
                                                children: "ACCESO GRATUITO"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 384,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "text-5xl font-black mb-12 italic tracking-tighter",
                                                children: [
                                                    "$0 ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-8081c023982104e3" + " " + "text-sm font-normal text-gray-600 uppercase tracking-widest",
                                                        children: "/SIEMPRE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 385,
                                                        columnNumber: 85
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 385,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "jsx-8081c023982104e3" + " " + "space-y-6 mb-16 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-bold text-gray-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 388,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "text-white",
                                                                children: "15 Días de Acceso PREMIUM Total"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 389,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-bold text-gray-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 19
                                                            }, this),
                                                            "5 Predicciones de IA al día (Post-Trial)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 391,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-bold text-gray-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 396,
                                                                columnNumber: 19
                                                            }, this),
                                                            "Estadísticas en tiempo real"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-bold text-gray-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 400,
                                                                columnNumber: 19
                                                            }, this),
                                                            "Centro de Notificaciones Básicas"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 399,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 386,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/login",
                                                className: "w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-center hover:bg-white/10 transition-all text-emerald-400",
                                                children: "INICIAR PRUEBA GRATIS"
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 404,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 380,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        className: "p-12 bg-gradient-to-br from-purple-800 to-blue-900 rounded-[4rem] border border-white/20 relative flex flex-col text-white shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "absolute top-0 right-0 p-8",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                    className: "w-24 h-24 opacity-10"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 413,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "flex justify-between items-start mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "jsx-8081c023982104e3" + " " + "text-3xl font-black uppercase tracking-tight italic",
                                                        children: "ELITE PREMIUM"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-8081c023982104e3" + " " + "bg-white text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]",
                                                        children: "RECOMENDADO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 418,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 416,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-8081c023982104e3" + " " + "text-5xl font-black mb-12 italic tracking-tighter",
                                                children: [
                                                    "$5 ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-8081c023982104e3" + " " + "text-sm font-normal opacity-60 uppercase tracking-widest",
                                                        children: "/mes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 85
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 420,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "jsx-8081c023982104e3" + " " + "space-y-6 mb-16 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-black",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 423,
                                                                columnNumber: 19
                                                            }, this),
                                                            "IA ILIMITADA SIN RESTRICCIONES"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-black text-purple-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 427,
                                                                columnNumber: 19
                                                            }, this),
                                                            "ACCESO PRO A COMBINADAS (PARLEYS)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 426,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "jsx-8081c023982104e3" + " " + "flex items-center gap-4 text-sm font-black text-blue-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-8081c023982104e3" + " " + "w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/page.tsx",
                                                                lineNumber: 431,
                                                                columnNumber: 19
                                                            }, this),
                                                            "ALERTAS HOT PICKS PRIORITARIAS"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/page.tsx",
                                                        lineNumber: 430,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 421,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleUpgrade,
                                                disabled: isRedirectingStripe,
                                                className: "jsx-8081c023982104e3" + " " + "w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-center hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50",
                                                children: isRedirectingStripe ? 'PROCESANDO...' : 'DESBLOQUEAR ACCESO ELITE ✨'
                                            }, void 0, false, {
                                                fileName: "[project]/web/app/page.tsx",
                                                lineNumber: 435,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 409,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 373,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$home$2f$SportsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        liveStats: otherSportsStats
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 447,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-8081c023982104e3" + " " + "border-t border-white/5 py-32 bg-white/[0.01]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$home$2f$NewsSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 450,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/app/page.tsx",
                            lineNumber: 449,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 448,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "jsx-8081c023982104e3" + " " + "container mx-auto px-4 py-32 text-center opacity-40",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "font-black text-4xl mb-6 tracking-tighter italic italic",
                                children: "PICKGENIUS"
                            }, void 0, false, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8081c023982104e3" + " " + "flex justify-center gap-8 mb-8 text-xs font-black uppercase tracking-widest",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        className: "hover:text-white",
                                        children: "Inicio"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 458,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/football-live",
                                        className: "hover:text-white",
                                        children: "Eventos en Vivo"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 459,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/props",
                                        className: "hover:text-white",
                                        children: "Props IA"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 460,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/privacy",
                                        className: "hover:text-white",
                                        children: "Legal"
                                    }, void 0, false, {
                                        fileName: "[project]/web/app/page.tsx",
                                        lineNumber: 461,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-8081c023982104e3" + " " + "text-[9px] font-black uppercase tracking-[0.5em] text-gray-500",
                                children: "© 2025 LUIS VASQUEZ • SISTEMA DE INTELIGENCIA DEPORTIVA AVANZADA"
                            }, void 0, false, {
                                fileName: "[project]/web/app/page.tsx",
                                lineNumber: 463,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/page.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "8081c023982104e3",
                children: "@keyframes scroll{0%{transform:translate(0)}to{transform:translate(-50%)}}.animate-scroll{width:200%;animation:30s linear infinite scroll;display:flex}.animate-scroll:hover{animation-play-state:paused}@keyframes aurora{0%{background-position:0%}to{background-position:200%}}.animate-aurora{background-size:200%;animation:8s linear infinite aurora}@keyframes slow-pulse{0%,to{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.1)}}.animate-slow-pulse{animation:10s ease-in-out infinite slow-pulse}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/app/page.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(HomePage, "4fKgQ0+WRo2b3ZR+tGZljWY5/kY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=web_36ddb35b._.js.map