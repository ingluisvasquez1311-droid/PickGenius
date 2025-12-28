(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/web/components/ui/TeamLogo.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamLogo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function TeamLogo({ teamId, teamName, size = 'md', className = '' }) {
    _s();
    // When teamId changes, we want to reset error. 
    // We can simulate this by using a key on the Image or wrapping div.
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };
    // Use our internal proxy endpoint
    const imgSrc = `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/team-logo/${teamId}`;
    // Reset error when teamId changes by checking if prop changed (or rely on key upstream)
    // To fix lint error, we remove the sync setState in effect.
    // Instead we can use a key on the image component to force re-mount or just reset state in a harmless way?
    const handleImageError = ()=>{
        setError(true);
    };
    // Use key={teamId} on the wrapper div so that the entire component (including the error state) 
    // resets whenever the teamId changes. This avoids the need for an effect and fixes the lint error.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${sizeClasses[size]} ${className} relative`,
        children: !error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            src: imgSrc,
            alt: `${teamName} logo`,
            fill: true,
            className: "object-contain",
            onError: handleImageError,
            unoptimized: true
        }, void 0, false, {
            fileName: "[project]/web/components/ui/TeamLogo.tsx",
            lineNumber: 41,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center border-2 border-purple-400/30 shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-white font-black text-lg",
                children: teamName ? teamName.charAt(0).toUpperCase() : '?'
            }, void 0, false, {
                fileName: "[project]/web/components/ui/TeamLogo.tsx",
                lineNumber: 53,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/ui/TeamLogo.tsx",
            lineNumber: 50,
            columnNumber: 17
        }, this)
    }, teamId, false, {
        fileName: "[project]/web/components/ui/TeamLogo.tsx",
        lineNumber: 39,
        columnNumber: 9
    }, this);
}
_s(TeamLogo, "AvrsuJm02Cqlq6/LWpvA21zDecQ=");
_c = TeamLogo;
var _c;
__turbopack_context__.k.register(_c, "TeamLogo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ui/SkeletonLoader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SkeletonLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function SkeletonLoader({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `glass-card p-4 relative overflow-hidden bg-white/[0.02] border border-white/5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
            }, void 0, false, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 5,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 bg-white/10 rounded-full w-24"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 8,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 bg-white/10 rounded-full w-12"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 9,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 7,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center bg-black/20 p-2 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-white/10"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 15,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-white/10 rounded w-32"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 16,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 14,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-6 bg-white/10 rounded w-8"
                            }, void 0, false, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 18,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 13,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center bg-black/20 p-2 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-white/10"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 23,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-white/10 rounded w-32"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 24,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 22,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-6 bg-white/10 rounded w-8"
                            }, void 0, false, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 26,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 21,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 12,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex justify-between items-center pt-3 border-t border-white/5 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-2 bg-white/10 rounded w-16"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 31,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-2 bg-white/10 rounded w-16"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 32,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 30,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
        lineNumber: 3,
        columnNumber: 9
    }, this);
}
_c = SkeletonLoader;
var _c;
__turbopack_context__.k.register(_c, "SkeletonLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/LiveEventsList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LiveEventsList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/TeamLogo.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/SkeletonLoader.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const EventCard = ({ event, sport })=>{
    _s();
    const { user, addFavorite, removeFavorite } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const isLive = event.status.type === 'inprogress';
    const isFinished = event.status.type === 'finished';
    const isScheduled = event.status.type === 'scheduled' || event.status.type === 'notstarted';
    const isTeamFavorite = (teamName)=>{
        return user?.favoriteTeams?.includes(teamName) || false;
    };
    const handleToggleFavorite = async (e, teamName)=>{
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        if (isTeamFavorite(teamName)) {
            await removeFavorite(teamName);
        } else {
            await addFavorite(teamName);
        }
    };
    const [now, setNow] = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(0);
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "EventCard.useEffect": ()=>{
            setNow(Math.floor(Date.now() / 1000));
            const interval = setInterval({
                "EventCard.useEffect.interval": ()=>{
                    setNow(Math.floor(Date.now() / 1000));
                }
            }["EventCard.useEffect.interval"], 30000); // Actualizar cada 30 segundos
            return ({
                "EventCard.useEffect": ()=>clearInterval(interval)
            })["EventCard.useEffect"];
        }
    }["EventCard.useEffect"], []);
    // Helper to get formatted elapsed time
    const getElapsedTime = ()=>{
        if (!isLive) return null;
        // If description already has time (e.g. 45', 90+2, Q1, HT)
        if (event.status.description?.includes("'") || event.status.description?.includes(":") || event.status.description === 'HT') {
            return event.status.description;
        }
        // Calculation fallback for football
        if (sport === 'football' && event.time?.currentPeriodStartTimestamp && now > 0) {
            const elapsedSeconds = now - event.time.currentPeriodStartTimestamp;
            let minutes = Math.floor(elapsedSeconds / 60);
            // Basic logic for halves
            if (event.status.description?.toLowerCase().includes('2nd') || event.status.description?.toLowerCase().includes('2a')) {
                minutes += 45;
            }
            return `${minutes}'`;
        }
        // Fallback for basketball (usually in description, but if not)
        if (sport === 'basketball' && event.status.description) {
            return event.status.description;
        }
        return 'LIVE';
    };
    // Format Match Start Time
    const matchTime = event.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    // Status Display
    let statusContent;
    let statusClass = "text-gray-400 font-mono";
    if (isLive) {
        const timeText = getElapsedTime();
        statusContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-red-500 font-black animate-pulse text-[10px] tracking-tighter",
                    children: timeText
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 137,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[7px] text-red-500/60 font-black uppercase tracking-widest leading-none mt-0.5",
                    children: "LIVE"
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 140,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/LiveEventsList.tsx",
            lineNumber: 136,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    } else if (isFinished) {
        statusContent = "Finalizado";
        statusClass = "text-gray-500 font-bold text-[10px] uppercase";
    } else {
        const matchDate = new Date(event.startTimestamp * 1000);
        const todayDate = new Date(now * 1000);
        const isToday = matchDate.toDateString() === todayDate.toDateString();
        const tomorrowDate = new Date((now + 86400) * 1000);
        const isTomorrow = matchDate.toDateString() === tomorrowDate.toDateString();
        const dayPrefix = isToday ? 'HOY' : isTomorrow ? 'MAÑ' : `${matchDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        }).toUpperCase()}`;
        statusContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[7px] text-gray-500 font-black mb-0.5 tracking-widest",
                    children: dayPrefix
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 158,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-bold text-white/70",
                    children: matchTime
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 159,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/LiveEventsList.tsx",
            lineNumber: 157,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/match/${sport}/${event.id}`,
        className: "group flex items-center gap-2 sm:gap-4 p-3 bg-[#111] border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-14 items-center justify-center flex flex-col border-r border-white/5 pr-2 sm:pr-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-xs text-center ${statusClass}`,
                        children: statusContent
                    }, void 0, false, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 171,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    event.roundInfo?.round && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] text-gray-600 mt-0.5",
                        children: [
                            "R",
                            event.roundInfo.round
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 175,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/LiveEventsList.tsx",
                lineNumber: 170,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end gap-2 sm:gap-3 text-right overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-end min-w-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: (e)=>handleToggleFavorite(e, event.homeTeam.name),
                                            className: `transition-all duration-300 ${isTeamFavorite(event.homeTeam.name) ? 'text-yellow-500' : 'text-white/5 hover:text-white/30'}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                className: `w-3 h-3 ${isTeamFavorite(event.homeTeam.name) ? 'fill-current' : ''}`
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                                lineNumber: 189,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 185,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-sm font-bold truncate ${isLive || isFinished ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`,
                                            children: event.homeTeam.name
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 191,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 184,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 183,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            event.homeScore?.redCards && event.homeScore.redCards > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2 h-3 bg-red-600 rounded-[1px] shadow-sm flex-shrink-0",
                                title: "Red Card"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 197,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                teamId: event.homeTeam.id,
                                teamName: event.homeTeam.name,
                                size: "sm",
                                className: "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 199,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 182,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center min-w-[50px] sm:min-w-[60px] font-mono font-black text-lg bg-black/20 rounded px-2 py-1",
                        children: isScheduled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-gray-600 text-sm",
                            children: "VS"
                        }, void 0, false, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 205,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 text-white",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: event.homeScore?.current ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 208,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-500",
                                    children: "-"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 209,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: event.awayScore?.current ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 210,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 207,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 203,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-start gap-2 sm:gap-3 text-left overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                teamId: event.awayTeam.id,
                                teamName: event.awayTeam.name,
                                size: "sm",
                                className: "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 217,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            event.awayScore?.redCards && event.awayScore.redCards > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2 h-3 bg-red-600 rounded-[1px] shadow-sm flex-shrink-0",
                                title: "Red Card"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 219,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-sm font-bold truncate ${isLive || isFinished ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`,
                                        children: event.awayTeam.name
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/LiveEventsList.tsx",
                                        lineNumber: 222,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>handleToggleFavorite(e, event.awayTeam.name),
                                        className: `transition-all duration-300 ${isTeamFavorite(event.awayTeam.name) ? 'text-yellow-500' : 'text-white/5 hover:text-white/30'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                            className: `w-3 h-3 ${isTeamFavorite(event.awayTeam.name) ? 'fill-current' : ''}`
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 229,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/LiveEventsList.tsx",
                                        lineNumber: 225,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 221,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 216,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/LiveEventsList.tsx",
                lineNumber: 180,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:flex items-center gap-2 pl-4 border-l border-white/5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-end",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-gray-500 uppercase font-black",
                                children: "Prob. IA"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 238,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-green-400 font-bold",
                                children: "76%"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 239,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 237,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-500 group-hover:text-primary transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M9 5l7 7-7 7"
                            }, void 0, false, {
                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                lineNumber: 243,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 242,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/web/components/LiveEventsList.tsx",
                        lineNumber: 241,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/LiveEventsList.tsx",
                lineNumber: 236,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/LiveEventsList.tsx",
        lineNumber: 165,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(EventCard, "nt6FvP+EUydQ/K1aj9yuuF+Rtyg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = EventCard;
;
function LiveEventsList({ events, sport, title, loading }) {
    _s1();
    // Priority Leagues Configuration
    // Priority Leagues Configuration
    const getPriorityLeagues = (sportParam)=>{
        if (sportParam === 'basketball') {
            return [
                'NBA',
                'Euroleague',
                'FIBA',
                'World Cup',
                'Liga Nacional',
                'LNB',
                'ACB',
                'Basket League',
                'Lega A' // Italy
            ];
        }
        return [
            // Tier 1: Top European Leagues
            'UEFA Champions League',
            'UEFA Europa League',
            'Premier League',
            'LaLiga',
            'Serie A',
            'Bundesliga',
            'Ligue 1',
            // Tier 2: Strong European Secondary Leagues
            'Championship',
            'Eredivisie',
            'Primeira Liga',
            'Belgian Pro League',
            'Scottish Premiership',
            'Turkish Super Lig',
            'Russian Premier League',
            // Tier 3: South American Leagues (High betting volume)
            'Primera Division',
            'Liga Profesional de Fútbol',
            'Copa de la Liga Profesional',
            'Brasileirão Série A',
            'Brasileirão Série B',
            'Copa Libertadores',
            'Copa Sudamericana',
            'Chilean Primera División',
            'Colombian Primera A',
            'Ecuadorian Serie A',
            // Tier 4: North/Central America
            'Major League Soccer',
            'Liga MX',
            'Liga MX Apertura',
            'Liga MX Clausura',
            // Tier 5: Asian Leagues (Growing markets)
            'J1 League',
            'K League 1',
            'Chinese Super League',
            // Tier 6: Other European Competitions
            'UEFA Conference League',
            'La Liga 2',
            'Serie B',
            '2. Bundesliga',
            'Ligue 2' // France 2nd tier
        ];
    };
    const PRIORITY_LEAGUES = getPriorityLeagues(sport);
    const [expandedGroups, setExpandedGroups] = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(new Set());
    // Effect to auto-expand priority leagues on load
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "LiveEventsList.useEffect": ()=>{
            if (loading || events.length === 0) return;
            const initialExpanded = new Set();
            events.forEach({
                "LiveEventsList.useEffect": (event)=>{
                    const countryName = event.tournament.category?.name || 'Internacional';
                    const leagueName = event.tournament.name;
                    const key = `${countryName}|${leagueName}`;
                    const isPriority = PRIORITY_LEAGUES.some({
                        "LiveEventsList.useEffect": (pl)=>leagueName.includes(pl)
                    }["LiveEventsList.useEffect"]) || PRIORITY_LEAGUES.some({
                        "LiveEventsList.useEffect": (pl)=>countryName.includes(pl)
                    }["LiveEventsList.useEffect"]);
                    if (isPriority) {
                        initialExpanded.add(key);
                    }
                }
            }["LiveEventsList.useEffect"]);
            // Expand at least the first group if nothing is priority
            if (initialExpanded.size === 0 && events.length > 0) {
                const countryName = events[0].tournament.category?.name || 'Internacional';
                const leagueName = events[0].tournament.name;
                initialExpanded.add(`${countryName}|${leagueName}`);
            }
            setExpandedGroups(initialExpanded);
        }
    }["LiveEventsList.useEffect"], [
        loading,
        events.length
    ]);
    const toggleGroup = (key)=>{
        setExpandedGroups((prev)=>{
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-bold mb-6 text-white",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 379,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        ...Array(6)
                    ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, i, false, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 382,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 380,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/LiveEventsList.tsx",
            lineNumber: 378,
            columnNumber: 13
        }, this);
    }
    if (events.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-gray-400",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg",
                children: "No hay eventos en este momento"
            }, void 0, false, {
                fileName: "[project]/web/components/LiveEventsList.tsx",
                lineNumber: 392,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/LiveEventsList.tsx",
            lineNumber: 391,
            columnNumber: 13
        }, this);
    }
    const groupedEvents = events.reduce((acc, event)=>{
        const countryName = event.tournament.category?.name || 'Internacional';
        const countryId = event.tournament.category?.id;
        const leagueName = event.tournament.name;
        // Unique Key for the League
        const key = `${countryName}|${leagueName}`;
        if (!acc[key]) {
            acc[key] = {
                country: countryName,
                countryId: countryId,
                league: leagueName,
                events: [],
                isPriority: PRIORITY_LEAGUES.some((pl)=>leagueName.includes(pl)) || PRIORITY_LEAGUES.some((pl)=>countryName.includes(pl))
            };
        }
        acc[key].events.push(event);
        return acc;
    }, {});
    // Sort Groups: Priority First, then Alphabetical
    const sortedGroups = Object.entries(groupedEvents).sort(([, a], [, b])=>{
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return a.country.localeCompare(b.country) || a.league.localeCompare(b.league);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-bold mb-6 text-white",
                children: title
            }, void 0, false, {
                fileName: "[project]/web/components/LiveEventsList.tsx",
                lineNumber: 426,
                columnNumber: 23
            }, this),
            sortedGroups.map(([key, group], index)=>{
                // Generate a unique ID for expansion state if key isn't enough
                const isExpanded = expandedGroups.has(key);
                // Also default expand the first few priority groups if user hasn't interacted? 
                // We'll rely on state. To auto-expand, we can use a mount effect, but simple is better.
                const hasLiveGames = group.events.some((e)=>e.status.type === 'inprogress');
                const liveCount = group.events.filter((e)=>e.status.type === 'inprogress').length;
                // Sort events inside the group: Live first, then by date
                const sortedEvents = [
                    ...group.events
                ].sort((a, b)=>{
                    const aLive = a.status.type === 'inprogress';
                    const bLive = b.status.type === 'inprogress';
                    if (aLive && !bLive) return -1;
                    if (!aLive && bLive) return 1;
                    return (a.startTimestamp || 0) - (b.startTimestamp || 0);
                });
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-xl overflow-hidden bg-[#080808] border border-white/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggleGroup(key),
                            className: `w-full flex items-center justify-between px-4 py-4 transition-all hover:bg-white/5 
                                ${isExpanded ? 'bg-white/5 border-b border-white/5' : ''}
                                ${group.isPriority ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-transparent'}
                            `,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg overflow-hidden border border-white/5",
                                            children: group.countryId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/category-image/${group.countryId}`,
                                                className: "w-full h-full object-cover",
                                                alt: group.country,
                                                onError: (e)=>{
                                                    // Fallback to emoji if image fails
                                                    const target = e.target;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerText = getCountryFlag(group.country) || (sport === 'football' ? '⚽' : '🏀');
                                                    }
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                                lineNumber: 459,
                                                columnNumber: 41
                                            }, this) : getCountryFlag(group.country) || (sport === 'football' ? '⚽' : '🏀')
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 457,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-left",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] uppercase font-black tracking-widest text-gray-500 mb-0.5",
                                                    children: group.country
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                                    lineNumber: 479,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-bold text-white leading-none",
                                                    children: group.league
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 478,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 455,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        liveCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-2 py-1 rounded bg-red-500/20 text-red-500 text-[10px] font-black uppercase animate-pulse",
                                            children: [
                                                liveCount,
                                                " EN VIVO"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 490,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded",
                                            children: group.events.length
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 494,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `transition-transform duration-300 transform ${isExpanded ? 'rotate-180' : ''}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-5 h-5 text-gray-500",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M19 9l-7 7-7-7"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/LiveEventsList.tsx",
                                                lineNumber: 498,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/LiveEventsList.tsx",
                                            lineNumber: 497,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 488,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 448,
                            columnNumber: 25
                        }, this),
                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col animate-in fade-in slide-in-from-top-1 duration-200",
                            children: sortedEvents.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EventCard, {
                                    event: event,
                                    sport: sport
                                }, event.id, false, {
                                    fileName: "[project]/web/components/LiveEventsList.tsx",
                                    lineNumber: 508,
                                    columnNumber: 37
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/web/components/LiveEventsList.tsx",
                            lineNumber: 506,
                            columnNumber: 29
                        }, this)
                    ]
                }, key, true, {
                    fileName: "[project]/web/components/LiveEventsList.tsx",
                    lineNumber: 447,
                    columnNumber: 21
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/LiveEventsList.tsx",
        lineNumber: 425,
        columnNumber: 9
    }, this);
}
_s1(LiveEventsList, "sUdGofQibe+KyL3sisFSNx5//48=");
_c1 = LiveEventsList;
// Simple helper for flags (can be expanded)
function getCountryFlag(country) {
    const map = {
        'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Spain': '🇪🇸',
        'Italy': '🇮🇹',
        'Germany': '🇩🇪',
        'France': '🇫🇷',
        'Portugal': '🇵🇹',
        'Netherlands': '🇳🇱',
        'Brazil': '🇧🇷',
        'Argentina': '🇦🇷',
        'USA': '🇺🇸',
        'Europe': '🇪🇺',
        'World': '🌍',
        'International': '🌍',
        'Africa': '🌍',
        'Colombia': '🇨🇴',
        'Mexico': '🇲🇽',
        'DR Congo': '🇨🇩',
        'Congo DR': '🇨🇩',
        'Ethiopia': '🇪🇹',
        'Libya': '🇱🇾',
        'Tanzania': '🇹🇿',
        'Egypt': '🇪🇬',
        'Nigeria': '🇳🇬',
        'Morocco': '🇲🇦',
        'Algeria': '🇩🇿',
        'Tunisia': '🇹🇳',
        'Uruguay': '🇺🇾',
        'Chile': '🇨🇱',
        'Ecuador': '🇪🇨',
        'Peru': '🇵🇪',
        'Paraguay': '🇵🇾',
        'Venezuela': '🇻🇪'
    };
    // Fuzzy match or direct
    return map[country] || map[Object.keys(map).find((k)=>country.toLowerCase().includes(k.toLowerCase())) || ''] || '';
}
var _c, _c1;
__turbopack_context__.k.register(_c, "EventCard");
__turbopack_context__.k.register(_c1, "LiveEventsList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ui/PremiumButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PremiumButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
'use client';
;
;
function PremiumButton({ children, onClick, variant = 'primary', className = '', loading = false, type = 'submit', disabled = false }) {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        secondary: 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
        whileHover: !disabled && !loading ? {
            scale: 1.02,
            y: -2
        } : {},
        whileTap: !disabled && !loading ? {
            scale: 0.98
        } : {},
        onClick: onClick,
        disabled: disabled || loading,
        type: type,
        className: `
                px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest
                transition-all duration-300 flex items-center justify-center gap-2
                ${variants[variant]}
                ${className}
                ${loading || disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `,
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/web/components/ui/PremiumButton.tsx",
                lineNumber: 47,
                columnNumber: 17
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/ui/PremiumButton.tsx",
        lineNumber: 32,
        columnNumber: 9
    }, this);
}
_c = PremiumButton;
var _c;
__turbopack_context__.k.register(_c, "PremiumButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ai/ParleyOptimizerModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ParleyOptimizerModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$PremiumButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/PremiumButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
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
const strategies = [
    {
        title: "Correlación de Props (Elite)",
        description: "Nuestro algoritmo detecta cuando el mercado de un jugador estrella (Puntos, Goles, Hits) está infravalorado respecto a la victoria de su equipo. Maximiza el multiplicador con riesgo controlado.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
        impact: "Alto",
        successRate: "78%",
        color: "text-purple-400",
        highlight: "bg-purple-500/10"
    },
    {
        title: "Hedge de Volatilidad",
        description: "Estrategia para parleys de 3+ piernas. Combinamos apuestas de alta probabilidad con un mercado de valor. La IA ajusta el peso de cada selección para garantizar equilibrio.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        impact: "Medio-Alto",
        successRate: "72%",
        color: "text-blue-400",
        highlight: "bg-blue-500/10"
    },
    {
        title: "Detección de Rachas (Streak-Rider)",
        description: "Encuentra jugadores o equipos que han superado sus líneas de forma consecutiva. El sistema optimiza el parley seleccionando solo rachas con momentum ascendente en todos los deportes.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
        impact: "Extremo",
        successRate: "81%",
        color: "text-orange-400",
        highlight: "bg-orange-500/10"
    }
];
const sportOptions = [
    {
        id: 'all',
        name: 'Mixto (Auto)',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        color: 'text-orange-400',
        desc: 'La IA elige los mejores de todos'
    },
    {
        id: 'football',
        name: 'Fútbol',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
        color: 'text-blue-400',
        desc: 'Goles, Córners y Props'
    },
    {
        id: 'basketball',
        name: 'Baloncesto',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
        color: 'text-purple-400',
        desc: 'NBA y Ligas Europeas'
    },
    {
        id: 'american-football',
        name: 'NFL',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        color: 'text-orange-400',
        desc: 'Touchdowns y Yardas'
    },
    {
        id: 'icehockey',
        name: 'NHL',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        color: 'text-blue-500',
        desc: 'Goles y Tiros a Puerta'
    },
    {
        id: 'baseball',
        name: 'Béisbol',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        color: 'text-emerald-400',
        desc: 'MLB y Hits/K\'s'
    },
    {
        id: 'tennis',
        name: 'Tenis',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
        color: 'text-yellow-400',
        desc: 'Sets y Ganadores'
    }
];
function ParleyOptimizerModal({ isOpen, onClose }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('sport');
    const [selectedSport, setSelectedSport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedMode, setSelectedMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pre');
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleGenerate = async ()=>{
        try {
            setLoading(true);
            setStep('loading');
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/predictions/parley', {
                method: 'POST',
                body: JSON.stringify({
                    strategyIndex: selectedIndex,
                    sport: selectedSport,
                    mode: selectedMode,
                    uid: user?.uid
                })
            });
            if (data && data.success && data.data) {
                setResult(data.data);
                setStep('result');
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(data.error || "No se pudo generar el parley");
                setStep('selection');
            }
        } catch (error) {
            console.error(error);
            __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Error de conexión");
            setStep('selection');
        } finally{
            setLoading(false);
        }
    };
    const reset = ()=>{
        setStep('sport');
        setResult(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        mode: "wait",
        children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    onClick: loading ? undefined : onClose,
                    className: "absolute inset-0 bg-black/80 backdrop-blur-md"
                }, void 0, false, {
                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                    lineNumber: 105,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.9,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.9,
                        y: 20
                    },
                    className: "relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-24 bg-gradient-to-br from-orange-600 to-purple-700 relative",
                            children: [
                                !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 126,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                    lineNumber: 122,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center px-10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                        className: "w-3 h-3 text-yellow-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 132,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-black uppercase tracking-widest text-white/80",
                                                        children: "Premium Intelligence"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 131,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black italic tracking-tighter text-white uppercase",
                                                children: "Parley Optimizer"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 135,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 130,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                    lineNumber: 129,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                            lineNumber: 120,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                mode: "wait",
                                children: [
                                    step === 'sport' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        exit: {
                                            opacity: 0,
                                            x: -20
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 text-sm font-medium italic",
                                                        children: "¿En qué deporte y modalidad quieres enfocar tu jugada hoy?"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 150,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex bg-white/5 p-1 rounded-xl border border-white/5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setSelectedMode('pre'),
                                                                className: `px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedMode === 'pre' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`,
                                                                children: "Próximos"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 156,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setSelectedMode('live'),
                                                                className: `px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedMode === 'live' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white'}`,
                                                                children: "En Vivo"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 162,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 149,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 md:grid-cols-3 gap-3",
                                                children: sportOptions.map((sport)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>{
                                                            setSelectedSport(sport.id);
                                                            setStep('selection');
                                                        },
                                                        className: `group p-4 rounded-3xl transition-all cursor-pointer border-2 bg-white/[0.02] border-white/5 hover:border-orange-500/30 hover:bg-white/5 flex flex-col items-center text-center`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `p-4 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform ${sport.color}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(sport.icon, {
                                                                    className: "w-6 h-6"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                    lineNumber: 182,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-xs font-black uppercase tracking-widest text-white mb-1",
                                                                children: sport.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[8px] text-gray-500 font-bold uppercase",
                                                                children: sport.desc
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 185,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, sport.id, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 49
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 171,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, "sport", true, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 143,
                                        columnNumber: 37
                                    }, this),
                                    step === 'selection' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        exit: {
                                            opacity: 0,
                                            x: -20
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 text-sm font-medium italic",
                                                        children: "Selecciona la estrategia de análisis:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 200,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setStep('sport'),
                                                        className: "text-[9px] font-black text-orange-400 uppercase tracking-widest hover:underline",
                                                        children: "← Cambiar Deporte"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 203,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 199,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: strategies.map((strategy, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>{
                                                            if (i > 0 && !user?.isPremium) {
                                                                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Estrategia Premium", {
                                                                    description: "Actualiza a Elite para desbloquear análisis de alto riesgo y valor."
                                                                });
                                                                return;
                                                            }
                                                            setSelectedIndex(i);
                                                        },
                                                        className: `group p-5 rounded-3xl transition-all cursor-pointer border-2 relative overflow-hidden ${selectedIndex === i ? 'bg-white/5 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'} ${i > 0 && !user?.isPremium ? 'opacity-50 grayscale-[0.5]' : ''}`,
                                                        children: [
                                                            i > 0 && !user?.isPremium && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute top-3 right-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                                    className: "w-4 h-4 text-gray-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                    lineNumber: 231,
                                                                    columnNumber: 61
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 230,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-start gap-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `p-3 rounded-xl bg-white/5 ${selectedIndex === i ? strategy.color : 'text-gray-500'}`,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(strategy.icon, {
                                                                            className: "w-5 h-5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                            lineNumber: 236,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 235,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex justify-between items-center mb-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: `text-base font-black italic uppercase tracking-tight ${selectedIndex === i ? 'text-white' : 'text-gray-400'}`,
                                                                                        children: strategy.title
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 240,
                                                                                        columnNumber: 65
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full",
                                                                                        children: [
                                                                                            "Hit ",
                                                                                            strategy.successRate
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 243,
                                                                                        columnNumber: 65
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 239,
                                                                                columnNumber: 61
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-[10px] text-gray-500 leading-tight mb-3",
                                                                                children: strategy.description
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 245,
                                                                                columnNumber: 61
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-4",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-1.5 text-gray-600",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                                                className: "w-3 h-3"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                                lineNumber: 248,
                                                                                                columnNumber: 69
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-[8px] font-black uppercase tracking-widest",
                                                                                                children: [
                                                                                                    "Impacto: ",
                                                                                                    strategy.impact
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                                lineNumber: 249,
                                                                                                columnNumber: 69
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 247,
                                                                                        columnNumber: 65
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-1.5 text-gray-600",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                                                className: "w-3 h-3 fill-gray-600"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                                lineNumber: 252,
                                                                                                columnNumber: 69
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-[8px] font-black uppercase tracking-widest",
                                                                                                children: "AI Tier 1"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                                lineNumber: 253,
                                                                                                columnNumber: 69
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 251,
                                                                                        columnNumber: 65
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 246,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 238,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 234,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 49
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 211,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-8",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$PremiumButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    onClick: handleGenerate,
                                                    className: "w-full py-4 rounded-xl flex items-center justify-center gap-2 group",
                                                    children: [
                                                        "Generar Parley Optimizado con IA ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                            className: "w-4 h-4 group-hover:animate-pulse"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                            lineNumber: 267,
                                                            columnNumber: 82
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 262,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, "selection", true, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 193,
                                        columnNumber: 37
                                    }, this),
                                    step === 'loading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            scale: 0.9
                                        },
                                        animate: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        exit: {
                                            opacity: 0,
                                            scale: 1.1
                                        },
                                        className: "py-20 flex flex-col items-center text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative mb-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 bg-orange-500/20 blur-[40px] rounded-full animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 282,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-16 h-16 text-orange-500 animate-spin relative z-10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 281,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-black italic uppercase tracking-widest mb-2 animate-pulse",
                                                children: "Analizando Mercado..."
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 285,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-500 text-sm max-w-xs",
                                                children: [
                                                    "Nuestra IA está simulando miles de resultados basados en la estrategia ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-orange-400",
                                                        children: [
                                                            '"',
                                                            strategies[selectedIndex].title,
                                                            '"'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 116
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 286,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, "loading", true, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 274,
                                        columnNumber: 37
                                    }, this),
                                    step === 'result' && result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        className: "space-y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-2 rounded-full bg-emerald-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 301,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-lg font-black italic uppercase tracking-tighter text-white",
                                                                children: result.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 302,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-black text-purple-400 uppercase tracking-widest",
                                                            children: [
                                                                "Riesgo: ",
                                                                result.riskLevel
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 304,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 299,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-white/5 border border-white/10 rounded-3xl overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-white/[0.03] border-b border-white/5 p-6 flex justify-between items-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                            lineNumber: 315,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        "Ticket Generado"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 53
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 313,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1",
                                                                        children: result.title || 'Parley sugerido'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 320,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xl font-bold text-white tracking-tight",
                                                                                children: [
                                                                                    result.confidence,
                                                                                    "% Confianza"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 322,
                                                                                columnNumber: 57
                                                                            }, this),
                                                                            result.isValueParley && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse",
                                                                                children: "VALOR DETECTADO"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 324,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 321,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 319,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-right",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1",
                                                                        children: "Cuota Total"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 331,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-2xl font-black text-orange-400",
                                                                        children: [
                                                                            "@",
                                                                            result.totalOdds || 'N/A'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 332,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 330,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 45
                                                    }, this),
                                                    result.isValueParley && result.valueAnalysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "px-4 py-2 bg-orange-500/10 border-y border-orange-500/20 mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 339,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " Análisis de Valor (Bet365)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 338,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-orange-300 italic",
                                                                children: result.valueAnalysis
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 341,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 md:p-6 space-y-4",
                                                        children: result.legs.map((leg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-xl group/leg",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white group-hover/leg:bg-orange-500/20 group-hover/leg:text-orange-400 transition-colors",
                                                                        children: i + 1
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 348,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-[10px] font-black text-gray-400 uppercase tracking-widest",
                                                                                        children: leg.matchName
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 353,
                                                                                        columnNumber: 65
                                                                                    }, this),
                                                                                    leg.startTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded flex items-center gap-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                                                className: "w-2 h-2"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                                lineNumber: 356,
                                                                                                columnNumber: 73
                                                                                            }, this),
                                                                                            " ",
                                                                                            leg.startTime
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 355,
                                                                                        columnNumber: 69
                                                                                    }, this),
                                                                                    (leg.pick.toLowerCase().includes('puntos') || leg.pick.toLowerCase().includes('rebotes') || leg.pick.toLowerCase().includes('hits') || leg.pick.toLowerCase().includes('home run') || leg.pick.toLowerCase().includes('strikeout')) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[8px] font-black bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                                                                        children: "Player Prop"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 360,
                                                                                        columnNumber: 69
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 352,
                                                                                columnNumber: 61
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm font-bold text-white flex items-center gap-2",
                                                                                children: [
                                                                                    leg.pick,
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                        className: "w-3 h-3 text-emerald-500"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                        lineNumber: 365,
                                                                                        columnNumber: 65
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                                lineNumber: 363,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 351,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-right",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[9px] font-black text-emerald-500 uppercase",
                                                                            children: [
                                                                                leg.confidence,
                                                                                "% Conf."
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                            lineNumber: 369,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                        lineNumber: 368,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 347,
                                                                columnNumber: 53
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 310,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-orange-500/5 border border-orange-500/10 rounded-2xl p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 mb-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                className: "w-4 h-4 text-orange-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 379,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] font-black text-orange-400 uppercase tracking-widest",
                                                                children: "Análisis IA de Combinada"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                                lineNumber: 380,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-400 leading-relaxed italic",
                                                        children: [
                                                            '"',
                                                            result.analysis,
                                                            '"'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 377,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-3 mt-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: reset,
                                                        className: "flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        children: "Nuevo Cálculo"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: onClose,
                                                        className: "flex-1 py-4 bg-orange-600 hover:bg-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20",
                                                        children: "Cerrar Terminal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                                lineNumber: 387,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, "result", true, {
                                        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                        lineNumber: 293,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                                lineNumber: 141,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                            lineNumber: 140,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
                    lineNumber: 113,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
            lineNumber: 104,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/web/components/ai/ParleyOptimizerModal.tsx",
        lineNumber: 102,
        columnNumber: 9
    }, this);
}
_s(ParleyOptimizerModal, "bdR+UNWNIuFfqS4+bEZcNDu+dHw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ParleyOptimizerModal;
var _c;
__turbopack_context__.k.register(_c, "ParleyOptimizerModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ai/ParleyOptimizerBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ParleyOptimizerBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$ParleyOptimizerModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ai/ParleyOptimizerModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ParleyOptimizerBanner({ className = "" }) {
    _s();
    const [showStrategies, setShowStrategies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `bg-gradient-to-br from-orange-600 to-amber-700 rounded-[2rem] p-6 text-white shadow-xl ${className}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-[10px] font-black uppercase tracking-widest opacity-80 mb-2",
                        children: "Power Ranking PickGenius"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ai/ParleyOptimizerBanner.tsx",
                        lineNumber: 16,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-black italic leading-tight mb-4",
                        children: "OPTIMIZACIÓN DE PARLEYS EN TIEMPO REAL"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ai/ParleyOptimizerBanner.tsx",
                        lineNumber: 17,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowStrategies(true),
                        className: "text-[10px] font-black uppercase tracking-widest bg-black/20 hover:bg-black/40 px-4 py-2 rounded-lg transition-colors",
                        children: "Ver Estrategias ↗"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ai/ParleyOptimizerBanner.tsx",
                        lineNumber: 18,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ai/ParleyOptimizerBanner.tsx",
                lineNumber: 15,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$ParleyOptimizerModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showStrategies,
                onClose: ()=>setShowStrategies(false)
            }, void 0, false, {
                fileName: "[project]/web/components/ai/ParleyOptimizerBanner.tsx",
                lineNumber: 26,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(ParleyOptimizerBanner, "XRrIqStyQmC9ts8T30pVMCQS9fE=");
_c = ParleyOptimizerBanner;
var _c;
__turbopack_context__.k.register(_c, "ParleyOptimizerBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/SportHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SportHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const SPORTS_LIST = [
    {
        name: 'Fútbol',
        href: '/football-live',
        emoji: '⚽'
    },
    {
        name: 'Baloncesto',
        href: '/basketball-live',
        emoji: '🏀'
    },
    {
        name: 'Fútbol Americano',
        href: '/american-football',
        emoji: '🏈'
    },
    {
        name: 'Béisbol',
        href: '/baseball',
        emoji: '⚾'
    },
    {
        name: 'Hockey',
        href: '/nhl',
        emoji: '🏒'
    },
    {
        name: 'Tenis',
        href: '/tennis',
        emoji: '🎾'
    },
    {
        name: 'Props Predictor',
        href: '/props',
        emoji: '🎯'
    }
];
function SportHeader({ title, sport, emoji, color, accentColor, subtitle }) {
    _s();
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-64 md:h-80 overflow-hidden mb-12 flex items-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 bg-gradient-to-r ${color} z-0`
            }, void 0, false, {
                fileName: "[project]/web/components/sports/SportHeader.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
            }, void 0, false, {
                fileName: "[project]/web/components/sports/SportHeader.tsx",
                lineNumber: 34,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute top-0 right-0 w-[50%] h-full ${accentColor} blur-[120px] -z-10`
            }, void 0, false, {
                fileName: "[project]/web/components/sports/SportHeader.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container relative z-10 w-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4 md:gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setIsMenuOpen(!isMenuOpen),
                            className: `w-20 h-20 md:w-28 md:h-28 ${color.split(' ')[1]} rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all relative group`,
                            children: [
                                emoji,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute -bottom-2 -right-2 w-8 h-8 bg-black/80 rounded-full border border-white/20 flex items-center justify-center text-xs animate-bounce",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        className: "w-4 h-4 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/SportHeader.tsx",
                                        lineNumber: 46,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/SportHeader.tsx",
                                    lineNumber: 45,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                            lineNumber: 40,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `h-px w-8 ${accentColor.replace('blur', '')}`
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                                            lineNumber: 52,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-[10px] font-black uppercase tracking-[0.4em] ${accentColor.replace('bg-', 'text-').replace('/5 ', '').replace('blur-[120px]', '')}`,
                                            children: [
                                                sport,
                                                " Analytics"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                                            lineNumber: 53,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/SportHeader.tsx",
                                    lineNumber: 51,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative inline-block",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsMenuOpen(!isMenuOpen),
                                        className: "group flex items-center gap-4 text-left p-2 -m-2 rounded-2xl hover:bg-white/5 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500",
                                                children: [
                                                    title,
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: accentColor.replace('bg-', 'text-').replace('/5 ', '').replace('blur-[120px]', ''),
                                                        children: "ELITE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/SportHeader.tsx",
                                                        lineNumber: 63,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/SportHeader.tsx",
                                                lineNumber: 62,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: `w-6 h-6 md:w-10 md:h-10 text-white/20 group-hover:text-white transition-all ${isMenuOpen ? 'rotate-180' : ''}`
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/SportHeader.tsx",
                                                lineNumber: 65,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/SportHeader.tsx",
                                        lineNumber: 58,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/SportHeader.tsx",
                                    lineNumber: 57,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400 font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase mt-3",
                                    children: subtitle || 'Stadium Vibes • Live Stats • Prediction IA'
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/SportHeader.tsx",
                                    lineNumber: 69,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                            lineNumber: 50,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/sports/SportHeader.tsx",
                    lineNumber: 38,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/web/components/sports/SportHeader.tsx",
                lineNumber: 37,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            onClick: ()=>setIsMenuOpen(false),
                            className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                            lineNumber: 80,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: -20,
                                scale: 0.95
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: -20,
                                scale: 0.95
                            },
                            className: "absolute left-1/2 -bottom-24 -translate-x-1/2 w-[90%] md:w-auto min-w-[300px] z-[101] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-4 shadow-2xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-3 gap-2",
                                children: SPORTS_LIST.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: s.href,
                                        onClick: ()=>setIsMenuOpen(false),
                                        className: "flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-2xl group-hover:scale-110 transition-transform",
                                                children: s.emoji
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/SportHeader.tsx",
                                                lineNumber: 101,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white",
                                                children: s.name
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/SportHeader.tsx",
                                                lineNumber: 102,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, s.href, true, {
                                        fileName: "[project]/web/components/sports/SportHeader.tsx",
                                        lineNumber: 95,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/SportHeader.tsx",
                                lineNumber: 93,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/SportHeader.tsx",
                            lineNumber: 87,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/web/components/sports/SportHeader.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/sports/SportHeader.tsx",
        lineNumber: 31,
        columnNumber: 9
    }, this);
}
_s(SportHeader, "vK10R+uCyHfZ4DZVnxbYkMWJB8g=");
_c = SportHeader;
var _c;
__turbopack_context__.k.register(_c, "SportHeader");
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
"[project]/web/lib/hooks/useSportsEvents.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSportsEvents",
    ()=>useSportsEvents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/services/sportsDataService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
function useSportsEvents(sport) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSportsEvents.useEffect": ()=>{
            console.log(`🌐 [useSportsEvents] API URL configured: ${("TURBOPACK compile-time value", "http://localhost:3001") || 'http://localhost:3001'}`);
        }
    }["useSportsEvents.useEffect"], []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'events',
            sport
        ],
        queryFn: {
            "useSportsEvents.useQuery": async ()=>{
                return await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventsBySport(sport);
            }
        }["useSportsEvents.useQuery"],
        refetchInterval: 60 * 1000,
        staleTime: 30 * 1000
    });
}
_s(useSportsEvents, "JKopywrsUaQZAyhWq7T7Gdbz5gM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/app/american-football/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AmericanFootballPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$LiveEventsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/LiveEventsList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/SkeletonLoader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$ParleyOptimizerBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ai/ParleyOptimizerBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$SportHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/sports/SportHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$hooks$2f$useSportsEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/hooks/useSportsEvents.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function AmericanFootballPage() {
    _s();
    const { data: allEvents = [], isLoading: loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$hooks$2f$useSportsEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSportsEvents"])('american-football');
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const { liveEvents, scheduledEvents } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AmericanFootballPage.useMemo": ()=>{
            return {
                liveEvents: allEvents.filter({
                    "AmericanFootballPage.useMemo": (e)=>e.status.type === 'inprogress'
                }["AmericanFootballPage.useMemo"]),
                scheduledEvents: allEvents.filter({
                    "AmericanFootballPage.useMemo": (e)=>e.status.type !== 'inprogress'
                }["AmericanFootballPage.useMemo"])
            };
        }
    }["AmericanFootballPage.useMemo"], [
        allEvents
    ]);
    let filteredEvents = [
        ...liveEvents,
        ...scheduledEvents
    ];
    if (filter === 'live') filteredEvents = liveEvents;
    else if (filter === 'upcoming') filteredEvents = scheduledEvents;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen pb-20 bg-[#050505] text-white selection:bg-orange-500/30",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$SportHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                title: "NFL",
                sport: "AMERICAN-FOOTBALL",
                emoji: "🏈",
                color: "from-orange-900/40 to-black",
                accentColor: "bg-orange-500/5 blur-[120px]",
                subtitle: "Gridiron Insights • Endzone Coverage • Playbook AI"
            }, void 0, false, {
                fileName: "[project]/web/app/american-football/page.tsx",
                lineNumber: 28,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 lg:grid-cols-12 gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "lg:col-span-3 space-y-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "glass-card p-6 border border-white/10 rounded-[2rem] bg-white/[0.02]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6",
                                            children: "FILTRAR EVENTOS"
                                        }, void 0, false, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 42,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                'all',
                                                'live',
                                                'upcoming'
                                            ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setFilter(f),
                                                    className: `w-full flex justify-between items-center px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300
                                                ${filter === f ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: f === 'all' ? 'Todos' : f === 'live' ? 'En Juego' : 'Programados'
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/app/american-football/page.tsx",
                                                            lineNumber: 54,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] opacity-50",
                                                                    children: f === 'live' ? liveEvents.length : f === 'upcoming' ? scheduledEvents.length : liveEvents.length + scheduledEvents.length
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                                    lineNumber: 56,
                                                                    columnNumber: 45
                                                                }, this),
                                                                f === 'live' && liveEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                                    lineNumber: 57,
                                                                    columnNumber: 87
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/app/american-football/page.tsx",
                                                            lineNumber: 55,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, f, true, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 45,
                                                    columnNumber: 37
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 43,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/app/american-football/page.tsx",
                                    lineNumber: 41,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "glass-card p-6 border border-white/5 bg-white/2 rounded-3xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] font-black uppercase text-gray-500 mb-1",
                                                    children: "Efectividad AI"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl font-black text-orange-500 tracking-tighter",
                                                    children: "78%"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 68,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 66,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "glass-card p-6 border border-white/5 bg-white/2 rounded-3xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] font-black uppercase text-gray-500 mb-1",
                                                    children: "Yardas Proy."
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 71,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl font-black tracking-tighter",
                                                    children: "280.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 72,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 70,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/app/american-football/page.tsx",
                                    lineNumber: 65,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$ParleyOptimizerBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/web/app/american-football/page.tsx",
                                    lineNumber: 77,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/app/american-football/page.tsx",
                            lineNumber: 40,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "lg:col-span-9",
                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/web/app/american-football/page.tsx",
                                lineNumber: 83,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-12 animate-in fade-in duration-700",
                                children: filter === 'all' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        liveEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between px-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-8 bg-red-500 rounded-full animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/american-football/page.tsx",
                                                                lineNumber: 93,
                                                                columnNumber: 57
                                                            }, this),
                                                            "🔴 EN VIVO AHORA"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/american-football/page.tsx",
                                                        lineNumber: 92,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$LiveEventsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    events: liveEvents,
                                                    sport: "american-football",
                                                    title: ""
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 90,
                                            columnNumber: 45
                                        }, this),
                                        scheduledEvents.filter((e)=>e.status.type === 'notstarted' || e.status.type === 'scheduled').length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between px-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-8 bg-orange-600 rounded-full"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/app/american-football/page.tsx",
                                                                lineNumber: 110,
                                                                columnNumber: 57
                                                            }, this),
                                                            "📅 PRÓXIMOS PARTIDOS"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/app/american-football/page.tsx",
                                                        lineNumber: 109,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$LiveEventsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    events: scheduledEvents.filter((e)=>e.status.type === 'notstarted' || e.status.type === 'scheduled'),
                                                    sport: "american-football",
                                                    title: ""
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 45
                                        }, this),
                                        filteredEvents.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-9xl mb-8 opacity-5",
                                                    children: "🏈"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 124,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 font-black uppercase tracking-[0.2em] text-sm",
                                                    children: "No hay actividad en la parrilla"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 125,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600 text-[10px] mt-4 uppercase",
                                                    children: "Explora mañana para más acción"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-8 px-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `w-3 h-8 rounded-full ${filter === 'live' ? 'bg-red-500' : 'bg-orange-600'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/app/american-football/page.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 49
                                                    }, this),
                                                    filter === 'live' ? '🔴 JUEGOS EN VIVO' : filter === 'upcoming' ? '📅 PRÓXIMOS' : 'JUEGOS'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/app/american-football/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 132,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$LiveEventsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            events: filteredEvents,
                                            sport: "american-football",
                                            title: ""
                                        }, void 0, false, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 138,
                                            columnNumber: 41
                                        }, this),
                                        filteredEvents.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-9xl mb-8 opacity-5",
                                                    children: "🏈"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 font-black uppercase tracking-[0.2em] text-sm",
                                                    children: "No se encontraron eventos"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/app/american-football/page.tsx",
                                                    lineNumber: 146,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/app/american-football/page.tsx",
                                            lineNumber: 144,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/web/app/american-football/page.tsx",
                                lineNumber: 85,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/app/american-football/page.tsx",
                            lineNumber: 81,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/app/american-football/page.tsx",
                    lineNumber: 38,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/web/app/american-football/page.tsx",
                lineNumber: 37,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/app/american-football/page.tsx",
        lineNumber: 27,
        columnNumber: 9
    }, this);
}
_s(AmericanFootballPage, "p4tf2FKqjc+YuhJPR5EGKnDZ1Ec=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$hooks$2f$useSportsEvents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSportsEvents"]
    ];
});
_c = AmericanFootballPage;
var _c;
__turbopack_context__.k.register(_c, "AmericanFootballPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=web_166ff240._.js.map