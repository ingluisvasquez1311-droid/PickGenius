import { db } from '../firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    type Timestamp
} from 'firebase/firestore';

export interface AppNotification {
    id: string;
    uid: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
    link?: string;
}

/**
 * Crear una nueva notificación para un usuario
 */
export async function createNotification(uid: string, data: Omit<AppNotification, 'id' | 'uid' | 'read' | 'timestamp'>): Promise<void> {
    if (!db) return;

    const notificationsRef = collection(db!, 'notifications');
    await addDoc(notificationsRef, {
        ...data,
        uid,
        read: false,
        timestamp: serverTimestamp()
    });
}

/**
 * Obtener las notificaciones de un usuario
 */
export async function getUserNotifications(uid: string, limitCount: number = 50): Promise<AppNotification[]> {
    if (!db) return [];

    const notificationsRef = collection(db!, 'notifications');
    const q = query(
        notificationsRef,
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            uid: data.uid,
            title: data.title,
            message: data.message,
            type: data.type,
            read: data.read,
            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
            link: data.link
        };
    });
}

/**
 * Marcar una notificación como leída
 */
export async function markAsRead(notificationId: string): Promise<void> {
    if (!db) return;

    const notificationRef = doc(db!, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        read: true
    });
}

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export async function markAllAsRead(uid: string): Promise<void> {
    if (!db) return;

    const notificationsRef = collection(db!, 'notifications');
    const q = query(notificationsRef, where('uid', '==', uid), where('read', '==', false));
    const querySnapshot = await getDocs(q);

    const promises = querySnapshot.docs.map(notificationDoc =>
        updateDoc(doc(db!, 'notifications', notificationDoc.id), { read: true })
    );

    await Promise.all(promises);
}
