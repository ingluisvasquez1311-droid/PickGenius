module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/web/lib/firebaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getFirebaseHealth",
    ()=>getFirebaseHealth,
    "getFirestore",
    ()=>getFirestore,
    "initializeFirebaseAdmin",
    ()=>initializeFirebaseAdmin,
    "verifyFirebaseConnection",
    ()=>verifyFirebaseConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs, [project]/web/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
// Singleton para evitar múltiples inicializaciones
let firebaseApp = null;
function initializeFirebaseAdmin() {
    // Si ya hay apps inicializadas, intentar recuperar la [DEFAULT]
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["apps"].length > 0) {
        console.log('✅ Re-usando instancia de Firebase Admin existente');
        firebaseApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["apps"][0];
        return firebaseApp;
    }
    try {
        console.log('🔧 Intentando inicializar Firebase Admin...');
        // MÉTODO 1: Intentar cargar desde archivo JSON (MÁS CONFIABLE)
        const possiblePaths = [
            // When started from PickGenius root
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), 'firebase-service-account.json'),
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), 'firebase-seervice-account.json'),
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), 'firebase-credentials.json'),
            // When started from web directory
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), '..', 'firebase-service-account.json'),
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), '..', 'firebase-seervice-account.json'),
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), '..', 'firebase-credentials.json'),
            // Absolute Windows paths
            'C:\\Users\\Daniel\\PickGenius\\firebase-service-account.json',
            'C:\\Users\\Daniel\\PickGenius\\firebase-seervice-account.json'
        ];
        for (const serviceAccountPath of possiblePaths){
            if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(serviceAccountPath)) {
                try {
                    const serviceAccount = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(serviceAccountPath, 'utf8'));
                    firebaseApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"]({
                        credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["credential"].cert(serviceAccount),
                        projectId: serviceAccount.project_id,
                        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
                    });
                    console.log(`✅ Firebase Admin inicializado desde archivo: ${serviceAccountPath}`);
                    console.log('  Project ID:', firebaseApp.options.projectId);
                    return firebaseApp;
                } catch (e) {
                    console.warn(`⚠️ Error leyendo ${serviceAccountPath}:`, e.message);
                }
            }
        }
        // MÉTODO 2: Usar FIREBASE_SERVICE_ACCOUNT (JSON completo en variable)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                firebaseApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"]({
                    credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["credential"].cert(serviceAccount),
                    projectId: serviceAccount.project_id,
                    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
                });
                console.log('✅ Firebase Admin inicializado desde FIREBASE_SERVICE_ACCOUNT');
                console.log('  Project ID:', firebaseApp.options.projectId);
                return firebaseApp;
            } catch (jsonError) {
                console.warn('⚠️ Error parseando FIREBASE_SERVICE_ACCOUNT');
            }
        }
        // MÉTODO 3: Usar variables individuales (ÚLTIMO RECURSO)
        const projectId = ("TURBOPACK compile-time value", "pickgenius") || process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (!projectId || !clientEmail) {
            throw new Error('Faltan credenciales de Firebase (projectId o clientEmail)');
        }
        // Intentar con Base64
        if (privateKeyBase64) {
            try {
                const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
                firebaseApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"]({
                    credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["credential"].cert({
                        projectId: projectId,
                        clientEmail: clientEmail,
                        privateKey: privateKey
                    }),
                    projectId: projectId,
                    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`
                });
                console.log('✅ Firebase Admin inicializado desde Base64');
                console.log('  Project ID:', firebaseApp.options.projectId);
                return firebaseApp;
            } catch (base64Error) {
                console.warn('⚠️ Error usando Base64');
            }
        }
        throw new Error('No se pudo inicializar Firebase con ningún método disponible');
    } catch (error) {
        console.error('❌ Error crítico al inicializar Firebase Admin:');
        console.error('Error Details:', error);
        // No throw here, return null to let the system handle "No connection" gracefully if possible
        // but since many services depend on it, we might still want to throw if it's a CRON task.
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to initialize Firebase Admin: ${errorMsg}`);
    }
}
let firestoreDb = null;
function getFirestore() {
    if (firestoreDb) return firestoreDb;
    const app = initializeFirebaseAdmin();
    firestoreDb = app.firestore();
    // Enforce ignoring undefined properties globally (ONLY ONCE)
    try {
        firestoreDb.settings({
            ignoreUndefinedProperties: true
        });
    } catch (e) {
        console.warn('⚠️ Firestore settings already applied or could not be set');
    }
    return firestoreDb;
}
async function verifyFirebaseConnection() {
    try {
        const db = getFirestore();
        await db.collection('_health_check').doc('test').set({
            timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["firestore"].FieldValue.serverTimestamp(),
            status: 'ok'
        });
        console.log('✅ Conexión a Firebase Firestore verificada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error verificando conexión a Firebase:', error);
        return false;
    }
}
async function getFirebaseHealth() {
    try {
        if (!firebaseApp) {
            firebaseApp = initializeFirebaseAdmin();
        }
        const db = getFirestore();
        await db.collection('_health_check').doc('status').set({
            timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["firestore"].FieldValue.serverTimestamp(),
            status: 'healthy'
        });
        return {
            connected: true,
            projectId: firebaseApp.options.projectId || null
        };
    } catch (error) {
        return {
            connected: false,
            projectId: process.env.FIREBASE_PROJECT_ID || ("TURBOPACK compile-time value", "pickgenius") || null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
const __TURBOPACK__default__export__ = {
    initializeFirebaseAdmin,
    getFirestore,
    verifyFirebaseConnection,
    getFirebaseHealth
};
}),
"[project]/web/lib/FirebaseReadService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "firebaseReadService",
    ()=>firebaseReadService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/firebaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/web/node_modules/firebase-admin)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
class FirebaseReadService {
    db;
    constructor(){
        this.db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFirestore"])();
    }
    /**
     * Verifica si hay datos recientes para un deporte y estado específico.
     * Útil para decidir si disparar una sincronización de fondo.
     */ async hasRecentData(sport, statusCategory) {
        try {
            const eventsRef = this.db.collection('events');
            let query = eventsRef.where('sport', '==', sport);
            if (statusCategory === 'live') {
                query = query.where('status', '==', 'inprogress');
            } else if (statusCategory === 'scheduled') {
                query = query.where('status', 'in', [
                    'notstarted',
                    'scheduled'
                ]);
            } else if (statusCategory === 'finished') {
                query = query.where('status', '==', 'finished');
            }
            const snapshot = await query.limit(1).get();
            return !snapshot.empty;
        } catch (error) {
            console.error(`[FirebaseRead] Error checking recent data for ${sport}:`, error);
            return false;
        }
    }
    /**
     * Obtiene juegos en vivo desde la colección 'events'
     */ async getLiveGames(sport) {
        try {
            const snapshot = await this.db.collection('events').where('sport', '==', sport).where('status', '==', 'inprogress').get();
            return this.mapSnapshotToEvents(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching live ${sport}:`, error);
            return [];
        }
    }
    /**
     * Obtiene juegos programados desde la colección 'events'
     */ async getScheduledGames(sport) {
        try {
            const now = new Date();
            const snapshot = await this.db.collection('events').where('sport', '==', sport).where('status', 'in', [
                'notstarted',
                'scheduled'
            ]).where('startTime', '>=', now).orderBy('startTime', 'asc').limit(50).get();
            return this.mapSnapshotToEvents(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching scheduled ${sport}:`, error);
            return [];
        }
    }
    /**
     * Obtiene un evento específico por ID desde la colección 'events'
     */ async getEventById(eventId) {
        try {
            // Buscamos por el ID del documento (que es el externalId de Sofascore)
            const doc = await this.db.collection('events').doc(eventId.toString()).get();
            if (!doc.exists) return null;
            const data = doc.data();
            // Mapeamos a la estructura de LiveEvent para consistencia
            const events = this.mapSnapshotToEvents({
                docs: [
                    doc
                ]
            });
            return events[0] || null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching event ${eventId} from Firebase:`, error);
            return null;
        }
    }
    async getMatchStats(gameId) {
        try {
            // Intentar buscar en matchStats (estructura antigua) o eventos enriquecidos
            const doc = await this.db.collection('matchStats').doc(gameId.toString()).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching match stats for ${gameId}:`, error);
            return null;
        }
    }
    async getMarketLine(gameId, sport) {
        try {
            // Ahora leemos de la colección 'odds' creada por el Robot 2
            const doc = await this.db.collection('odds').doc(`${sport}_${gameId}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching market line for ${gameId}:`, error);
            return null;
        }
    }
    mapSnapshotToEvents(snapshot) {
        return snapshot.docs.map((doc)=>{
            const data = doc.data();
            // Mapeo de compatibilidad con LiveEvent interface del frontend
            return {
                ...data,
                id: data.externalId || doc.id,
                status: {
                    type: data.status,
                    description: data.statusDescription || (data.status === 'inprogress' ? 'En Vivo' : data.status === 'finished' ? 'Finalizado' : 'Programado')
                },
                homeScore: {
                    current: data.homeTeam?.score || 0,
                    period1: data.homeTeam?.halfScore || 0
                },
                awayScore: {
                    current: data.awayTeam?.score || 0,
                    period1: data.awayTeam?.halfScore || 0
                },
                // Asegurar que Teams tengan el formato { id, name, logo }
                homeTeam: {
                    id: data.homeTeam?.id,
                    name: data.homeTeam?.name,
                    logo: data.homeTeam?.logo
                },
                awayTeam: {
                    id: data.awayTeam?.id,
                    name: data.awayTeam?.name,
                    logo: data.awayTeam?.logo
                },
                startTime: data.startTime instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["Timestamp"] ? data.startTime.toDate() : data.startTime ? new Date(data.startTime) : new Date(),
                syncedAt: data.syncedAt instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["Timestamp"] ? data.syncedAt.toDate() : data.syncedAt ? new Date(data.syncedAt) : new Date(),
                startTimestamp: data.startTime instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2d$admin$29$__["Timestamp"] ? Math.floor(data.startTime.toDate().getTime() / 1000) : data.startTime ? Math.floor(new Date(data.startTime).getTime() / 1000) : 0
            };
        });
    }
}
const firebaseReadService = new FirebaseReadService();
const __TURBOPACK__default__export__ = firebaseReadService;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web/app/api/tennis/scheduled/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$FirebaseReadService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/FirebaseReadService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/firebaseAdmin.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$FirebaseReadService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$FirebaseReadService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
try {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeFirebaseAdmin"])();
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}
const dynamic = 'force-dynamic';
const revalidate = 0;
async function GET() {
    const startTime = Date.now();
    const SPORT_ID = 'tennis';
    const TYPE = 'scheduled';
    try {
        const hasRecentData = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$FirebaseReadService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["firebaseReadService"].hasRecentData(SPORT_ID, TYPE);
        if (!hasRecentData) {
            console.warn(`⚠️ No recent data for ${SPORT_ID} ${TYPE}, triggering background sync`);
            fetch(`http://localhost:3001/api/trigger/sofascore`, {
                method: 'POST'
            }).catch((err)=>console.error('Sync trigger failed:', err));
        }
        const games = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$FirebaseReadService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["firebaseReadService"].getScheduledGames(SPORT_ID);
        const duration = Date.now() - startTime;
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            events: games
        }, {
            headers: {
                'X-Response-Time': `${duration}ms`,
                'X-Data-Source': 'firebase'
            }
        });
    } catch (error) {
        console.error(`❌ Error in ${SPORT_ID} ${TYPE} route:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch games'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__30ef3873._.js.map