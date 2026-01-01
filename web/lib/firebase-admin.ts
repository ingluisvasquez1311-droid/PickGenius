import * as admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * Uses environment variables from .env.local for secure access.
 */

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeFirebase() {
    if (!admin.apps.length) {
        if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
            console.warn('[Firebase Admin] Missing credentials! Check .env.local for FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
            return null;
        }

        try {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
            });
            console.log('✅ [Firebase Admin] Connected to Project:', firebaseConfig.projectId);
        } catch (error) {
            console.error('❌ [Firebase Admin] Initialization Error:', error);
            return null;
        }
    }
    return admin.firestore();
}

export const db = initializeFirebase();
export default admin;
