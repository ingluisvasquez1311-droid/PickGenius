import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// You need to generate a VAPID key in Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration
// And paste it here or in .env.local
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY_HERE';

export interface NotificationPermissionStatus {
    permission: NotificationPermission;
    token?: string;
    error?: string;
}

export const requestNotificationPermission = async (userId?: string): Promise<NotificationPermissionStatus> => {
    if (!messaging) {
        return { permission: 'denied', error: 'Messaging not initialized' };
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (token) {
                console.log('🔥 FCM Token generated:', token);

                // Save token to user profile if logged in
                if (userId && db) {
                    await saveTokenToUser(userId, token);
                }

                return { permission, token };
            }
        }

        return { permission };
    } catch (error: any) {
        console.error('❌ Error requesting notification permission:', error);
        return { permission: 'denied', error: error.message };
    }
};

export const saveTokenToUser = async (userId: string, token: string) => {
    if (!db) {
        console.error('❌ Firestore not initialized');
        return;
    }

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            lastTokenUpdate: new Date().toISOString()
        });
        console.log('✅ Token saved to user profile');
    } catch (error) {
        console.error('❌ Error saving token to user:', error);
    }
};

export const onMessageListener = () => {
    if (!messaging) return Promise.resolve(null);

    return new Promise((resolve) => {
        onMessage(messaging!, (payload) => {
            console.log('📩 Foreground Message received:', payload);
            resolve(payload);
        });
    });
};
