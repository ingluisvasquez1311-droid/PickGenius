import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Singleton para evitar múltiples inicializaciones
let firebaseApp: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
    // Si ya hay apps inicializadas, intentar recuperar la [DEFAULT]
    if (admin.apps.length > 0) {
        console.log('✅ Re-usando instancia de Firebase Admin existente');
        firebaseApp = admin.apps[0]!;
        return firebaseApp;
    }

    try {
        console.log('🔧 Intentando inicializar Firebase Admin...');

        // MÉTODO 1: Intentar cargar desde archivo JSON (MÁS CONFIABLE)
        const possiblePaths = [
            // When started from PickGenius root
            join(process.cwd(), 'firebase-service-account.json'),
            join(process.cwd(), 'firebase-seervice-account.json'), // Soporte para el typo detectado
            join(process.cwd(), 'firebase-credentials.json'),
            // When started from web directory
            join(process.cwd(), '..', 'firebase-service-account.json'),
            join(process.cwd(), '..', 'firebase-seervice-account.json'),
            join(process.cwd(), '..', 'firebase-credentials.json'),
            // Absolute Windows paths
            'C:\\Users\\Daniel\\PickGenius\\firebase-service-account.json',
            'C:\\Users\\Daniel\\PickGenius\\firebase-seervice-account.json'
        ];

        for (const serviceAccountPath of possiblePaths) {
            if (existsSync(serviceAccountPath)) {
                try {
                    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

                    firebaseApp = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId: serviceAccount.project_id,
                        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
                    });

                    console.log(`✅ Firebase Admin inicializado desde archivo: ${serviceAccountPath}`);
                    console.log('  Project ID:', firebaseApp.options.projectId);
                    return firebaseApp;
                } catch (e: any) {
                    console.warn(`⚠️ Error leyendo ${serviceAccountPath}:`, e.message);
                }
            }
        }

        // MÉTODO 2: Usar FIREBASE_SERVICE_ACCOUNT (JSON completo en variable)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
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
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

        if (!projectId || !clientEmail) {
            throw new Error('Faltan credenciales de Firebase (projectId o clientEmail)');
        }

        // Intentar con Base64
        if (privateKeyBase64) {
            try {
                const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');

                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert({
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

    } catch (error: any) {
        console.error('❌ Error crítico al inicializar Firebase Admin:');
        console.error('Error Details:', error);

        // No throw here, return null to let the system handle "No connection" gracefully if possible
        // but since many services depend on it, we might still want to throw if it's a CRON task.
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to initialize Firebase Admin: ${errorMsg}`);
    }
}

let firestoreDb: admin.firestore.Firestore | null = null;

// Obtener instancia de Firestore
export function getFirestore(): admin.firestore.Firestore {
    if (firestoreDb) return firestoreDb;

    const app = initializeFirebaseAdmin();
    firestoreDb = app.firestore();

    // Enforce ignoring undefined properties globally (ONLY ONCE)
    try {
        firestoreDb.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
        console.warn('⚠️ Firestore settings already applied or could not be set');
    }

    return firestoreDb;
}

// Verificar conexión a Firebase
export async function verifyFirebaseConnection(): Promise<boolean> {
    try {
        const db = getFirestore();

        await db.collection('_health_check').doc('test').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'ok'
        });

        console.log('✅ Conexión a Firebase Firestore verificada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error verificando conexión a Firebase:', error);
        return false;
    }
}

// Health check
export async function getFirebaseHealth(): Promise<{
    connected: boolean;
    projectId: string | null;
    error?: string;
}> {
    try {
        if (!firebaseApp) {
            firebaseApp = initializeFirebaseAdmin();
        }

        const db = getFirestore();

        await db.collection('_health_check').doc('status').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'healthy'
        });

        return {
            connected: true,
            projectId: firebaseApp.options.projectId || null
        };
    } catch (error) {
        return {
            connected: false,
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export default {
    initializeFirebaseAdmin,
    getFirestore,
    verifyFirebaseConnection,
    getFirebaseHealth
};
