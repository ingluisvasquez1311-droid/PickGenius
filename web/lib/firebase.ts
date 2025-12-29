import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim()
};

// Check if we have the minimum required config
const hasValidConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if we have valid config and it hasn't been initialized
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let messaging: Messaging | null = null;
const googleProvider = new GoogleAuthProvider();

if (hasValidConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Messaging only on client-side
    if (typeof window !== 'undefined') {
        try {
            messaging = getMessaging(app);
            console.log('[Firebase] Messaging initialized');
        } catch (msgErr) {
            console.warn('[Firebase] Messaging failed to initialize (likely due to Service Worker issues or incompatible browser):', msgErr);
        }
    }

    console.log('[Firebase] Initialized successfully');
} else {
    console.warn('[Firebase] Not initialized - missing config');
}

// Debug logging AFTER initialization
const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

console.log('[Firebase Diagnostic]', {
    hasApp: !!app,
    hasMessaging: !!messaging,
    env: process.env.NODE_ENV,
    config: {
        apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...${firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length - 5)}` : 'MISSING',
        projectId: firebaseConfig.projectId || 'MISSING',
        authDomain: firebaseConfig.authDomain || 'MISSING'
    },
    missing: missingVars.length > 0 ? missingVars : 'NONE'
});

if (missingVars.length > 0) {
    console.error('❌ CONFIGURACIÓN DE FIREBASE INCOMPLETA. Revisa .env.local');
}

export { auth, db, app, googleProvider, messaging };
