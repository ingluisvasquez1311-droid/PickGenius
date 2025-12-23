import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        // Try Base64-encoded service account JSON first (recommended for Vercel)
        const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

        if (serviceAccountBase64) {
            const serviceAccount = JSON.parse(
                Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
            );
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('[Firebase Admin] Initialized successfully with service account JSON');
        } else {
            // Fallback to individual env vars
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (projectId && clientEmail && privateKey) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                console.log('[Firebase Admin] Initialized successfully with individual env vars');
            } else {
                console.warn('[Firebase Admin] Missing environment variables. Skipping initialization (expected during build).');
            }
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization error:', error);
    }
}

// Lazy-initialized Firestore export
export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
export { admin };
