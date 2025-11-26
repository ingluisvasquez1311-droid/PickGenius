import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    // Usando la API Key original del proyecto 'pickgenius'
    apiKey: 'AIzaSyOLWgzGFXkU8eNbezJeLLMPZ4DWjkM',
    authDomain: 'pickgenius.firebaseapp.com',
    projectId: 'pickgenius',
    storageBucket: 'pickgenius.firebasestorage.app',
    messagingSenderId: '994608420829',
    appId: '1:994608420829:web:f0177c5fff7e7ea8b27f107'
};

// Debug logging (remove after fixing)
console.log('[Firebase] Config loaded:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId
});

// Check if we have the minimum required config
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

console.log('[Firebase] Has valid config:', hasValidConfig);

// Initialize Firebase only if we have valid config and it hasn't been initialized
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (hasValidConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Initialized successfully');
} else {
    console.warn('[Firebase] Not initialized - missing config');
}

export { auth, db, app };
