import admin from 'firebase-admin';

if (!admin.apps.length) {
    let initialized = false;

    // 1. Try Base64-encoded service account (Priority)
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (serviceAccountBase64) {
        try {
            const buffer = Buffer.from(serviceAccountBase64, 'base64');
            const serviceAccount = JSON.parse(buffer.toString('utf-8'));

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            initialized = true;
            console.log('✅ [Firebase Admin] Initialized with Base64 Service Account');
        } catch (error) {
            console.warn('⚠️ [Firebase Admin] Bad Base64 Key. Falling back to individual vars...', error);
        }
    }

    // 2. Fallback to individual vars if not yet initialized
    if (!initialized) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                console.log('✅ [Firebase Admin] Initialized with Individual Env Vars');
            } catch (error) {
                console.error('❌ [Firebase Admin] Failed to initialize with Env Vars:', error);
            }
        } else {
            // Only warn if we didn't try base64 either, or both failed
            if (!serviceAccountBase64) {
                console.warn('❌ [Firebase Admin] Missing ALL credentials. Admin SDK inactive.');
            }
        }
    }
}


// Lazy-initialized Firestore export
export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
export { admin };
