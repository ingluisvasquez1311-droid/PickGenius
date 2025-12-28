module.exports = [
"[project]/web/lib/firebaseAdmin.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[root-of-the-server]__ab048d97._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/web/lib/firebaseAdmin.ts [app-route] (ecmascript)");
    });
});
}),
"[externals]/firebase-admin [external] (firebase-admin, cjs, [project]/web/node_modules/firebase-admin, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_firebase-admin_19540daf._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/firebase-admin [external] (firebase-admin, cjs, [project]/web/node_modules/firebase-admin)");
    });
});
}),
"[project]/web/lib/api.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/web_lib_api_ts_513fb567._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/web/lib/api.ts [app-route] (ecmascript)");
    });
});
}),
];