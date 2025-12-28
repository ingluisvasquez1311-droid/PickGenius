module.exports = [
"[project]/web/lib/services/googleProfileSync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isGoogleUser",
    ()=>isGoogleUser,
    "syncGoogleProfile",
    ()=>syncGoogleProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$userService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/userService.ts [app-ssr] (ecmascript)");
;
async function syncGoogleProfile(firebaseUser) {
    const uid = firebaseUser.uid;
    const displayName = firebaseUser.displayName;
    const photoURL = firebaseUser.photoURL;
    const email = firebaseUser.email;
    console.log('🔄 [Google Sync] Iniciando sincronización de perfil...');
    console.log('👤 [Google Sync] Display Name:', displayName);
    console.log('🖼️ [Google Sync] Photo URL:', photoURL ? 'Sí' : 'No');
    try {
        // Actualizar perfil en Firestore con datos de Google
        const updates = {};
        if (displayName) {
            updates.displayName = displayName;
        }
        if (photoURL) {
            updates.photoURL = photoURL;
        }
        // Bio automática si no existe
        if (displayName) {
            updates.bio = `Usuario autenticado con Google - ${displayName}`;
        }
        // Solo actualizar si hay cambios
        if (Object.keys(updates).length > 0) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$userService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserProfile"])(uid, updates);
            console.log('✅ [Google Sync] Perfil sincronizado correctamente:', updates);
        } else {
            console.log('ℹ️ [Google Sync] No hay datos nuevos para sincronizar');
        }
    } catch (error) {
        console.error('❌ [Google Sync] Error al sincronizar perfil:', error);
    // No hacer throw para no interrumpir el flujo de login
    }
}
function isGoogleUser(firebaseUser) {
    return firebaseUser.providerData.some((provider)=>provider.providerId === 'google.com');
}
}),
];

//# sourceMappingURL=web_lib_services_googleProfileSync_ts_0d768769._.js.map