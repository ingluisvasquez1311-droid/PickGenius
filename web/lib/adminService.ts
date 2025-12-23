import { db } from './firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';

/**
 * Log an API call for monitoring
 */
export async function logApiCall(service: string, endpoint: string, status: number = 200) {
    if (!db) return;
    try {
        await addDoc(collection(db, 'admin_api_logs'), {
            service, // 'Groq', 'Gemini', 'Sofascore'
            endpoint,
            status,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging API call:', error);
    }
}

/**
 * Log when a user hits their limit
 */
export async function logLimitAlert(uid: string, email: string) {
    if (!db) return;
    try {
        await addDoc(collection(db, 'admin_alerts'), {
            type: 'LIMIT_EXCEEDED',
            uid,
            email,
            message: `Usuario ${email} ha superado su límite diario de predicciones.`,
            timestamp: serverTimestamp(),
            read: false
        });
    } catch (error) {
        console.error('Error logging limit alert:', error);
    }
}

/**
 * Fetch traffic stats for the last 24 hours
 */
export async function getTrafficStats() {
    if (!db) return [];
    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, 'admin_api_logs'),
            where('timestamp', '>=', Timestamp.fromDate(last24h)),
            orderBy('timestamp', 'asc'), // Ascending for time charts
            limit(500) // Increase limit for aggregate data
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamp to Date for grouping
            date: (doc.data() as any).timestamp?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching traffic stats:', error);
        return [];
    }
}

/**
 * Fetch latest admin alerts
 */
export async function getAdminAlerts(limitCount: number = 10) {
    if (!db) return [];
    try {
        const q = query(
            collection(db, 'admin_alerts'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
        const snap = await getDocs(q);
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
 * Trigger a full recalculation of scores and outcomes
 */
export async function recalculateScores() {
    try {
        const response = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'RECALCULATE' })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Error al recalcular puntuaciones');
    }
}

/**
 * Reset global system cache
 */
export async function resetCache() {
    try {
        const response = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'CLEAR_CACHE' })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Error al reiniciar cache');
    }
}

/**
 * Broadcast a notification to all users
 */
export async function broadcastNotification(message: string) {
    try {
        const response = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'NOTIFY_ALL', payload: { message } })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Error al enviar notificación masiva');
    }
}
