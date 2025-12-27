// Quitamos importaciones estáticas que rompen el navegador
// import { getFirestore } from './firebaseAdmin';
// import { fetchAPI } from './api';
// import * as admin from 'firebase-admin';

/**
 * Log an API call for monitoring
 */
export async function logApiCall(service: string, endpoint: string, status: number = 200) {
    if (typeof window !== 'undefined') return; // Do not run on client
    try {
        const { getFirestore } = await import('./firebaseAdmin');
        const admin = await import('firebase-admin');
        const db = getFirestore();
        await db.collection('admin_api_logs').add({
            service, // 'Groq', 'Gemini', 'Sofascore'
            endpoint,
            status,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging API call:', error);
    }
}

/**
 * Log when a user hits their limit
 */
export async function logLimitAlert(uid: string, email: string) {
    if (typeof window !== 'undefined') return; // Do not run on client
    try {
        const { getFirestore } = await import('./firebaseAdmin');
        const admin = await import('firebase-admin');
        const db = getFirestore();
        await db.collection('admin_alerts').add({
            type: 'LIMIT_EXCEEDED',
            uid,
            email,
            message: `Usuario ${email} ha superado su límite diario de predicciones.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false
        });
    } catch (error) {
        console.error('Error logging limit alert:', error);
    }
}

/**
 * Fetch traffic stats for the last 24 hours (Admin SDK version)
 */
export async function getTrafficStats() {
    try {
        const { getFirestore } = await import('./firebaseAdmin');
        const admin = await import('firebase-admin');
        const db = getFirestore();
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const snap = await db.collection('admin_api_logs')
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(last24h))
            .orderBy('timestamp', 'asc')
            .limit(500)
            .get();

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: (doc.data() as any).timestamp?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching traffic stats:', error);
        return [];
    }
}

/**
 * Fetch latest global activity (Admin SDK version)
 */
export async function getGlobalActivity(limitCount: number = 20) {
    try {
        const { getFirestore } = await import('./firebaseAdmin');
        const db = getFirestore();
        const snap = await db.collection('stats_predictions')
            .orderBy('timestamp', 'desc')
            .limit(limitCount)
            .get();

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: (doc.data() as any).timestamp?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching global activity:', error);
        return [];
    }
}

/**
 * Fetch latest admin alerts (Admin SDK version)
 */
export async function getAdminAlerts(limitCount: number = 10) {
    try {
        const { getFirestore } = await import('./firebaseAdmin');
        const db = getFirestore();
        const snap = await db.collection('admin_alerts')
            .orderBy('timestamp', 'desc')
            .limit(limitCount)
            .get();

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: (doc.data() as any).timestamp?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching admin alerts:', error);
        return [];
    }
}

/**
 * Trigger a full recalculation
 */
export async function recalculateScores() {
    try {
        const { fetchAPI } = await import('./api');
        return await fetchAPI('/api/admin/actions', {
            method: 'POST',
            body: JSON.stringify({ action: 'RECALCULATE' })
        });
    } catch (error) {
        throw new Error('Error al recalcular puntuaciones');
    }
}

/**
 * Reset global system cache
 */
export async function resetCache() {
    try {
        const { fetchAPI } = await import('./api');
        return await fetchAPI('/api/admin/actions', {
            method: 'POST',
            body: JSON.stringify({ action: 'CLEAR_CACHE' })
        });
    } catch (error) {
        throw new Error('Error al reiniciar cache');
    }
}

/**
 * Broadcast a notification
 */
export async function broadcastNotification(message: string) {
    try {
        const { fetchAPI } = await import('./api');
        return await fetchAPI('/api/admin/actions', {
            method: 'POST',
            body: JSON.stringify({ action: 'NOTIFY_ALL', payload: { message } })
        });
    } catch (error) {
        throw new Error('Error al enviar notificación masiva');
    }
}
