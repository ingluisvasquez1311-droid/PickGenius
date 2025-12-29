import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Utility to elevate a user to admin role.
 * Run this in the console or via a temporary button if needed.
 */
export async function elevateToAdmin(uid: string) {
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        role: 'admin',
        isPremium: true
    });
    console.log(`✅ User ${uid} is now an ADMIN.`);
}
