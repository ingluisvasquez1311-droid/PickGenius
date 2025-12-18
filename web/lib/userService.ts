import { db } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    email: string;
    isPremium: boolean;
    subscriptionEnd?: Date;
    predictionsUsed: number;
    predictionsLimit: number;
    favoriteTeams: string[];
    createdAt: Date;
    lastLogin: Date;
    role: 'admin' | 'user';
}

/**
 * Create a new user profile in Firestore
 */
export async function createUserProfile(uid: string, email: string): Promise<UserProfile> {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    const userRef = doc(db, 'users', uid);

    const newProfile: Omit<UserProfile, 'createdAt' | 'lastLogin'> & {
        createdAt: any;
        lastLogin: any;
    } = {
        uid,
        email,
        isPremium: false,
        predictionsUsed: 0,
        predictionsLimit: 3, // Free tier: 3 predictions per day
        favoriteTeams: [],
        createdAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user' // Default role
    };

    await setDoc(userRef, newProfile);

    return {
        ...newProfile,
        createdAt: new Date(),
        lastLogin: new Date()
    };
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return null;
    }

    const data = userSnap.data();
    return {
        uid: data.uid,
        email: data.email,
        isPremium: data.isPremium || false,
        subscriptionEnd: data.subscriptionEnd?.toDate(),
        predictionsUsed: data.predictionsUsed || 0,
        predictionsLimit: data.predictionsLimit || 3,
        favoriteTeams: data.favoriteTeams || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
        role: data.role || 'user'
    };
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(uid: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        lastLogin: serverTimestamp()
    });
}

/**
 * Add a team to user's favorites
 */
export async function addFavoriteTeam(uid: string, teamName: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        favoriteTeams: arrayUnion(teamName)
    });
}

/**
 * Remove a team from user's favorites
 */
export async function removeFavoriteTeam(uid: string, teamName: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        favoriteTeams: arrayRemove(teamName)
    });
}

/**
 * Increment predictions used counter
 */
export async function incrementPredictionsUsed(uid: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const currentCount = userSnap.data().predictionsUsed || 0;
        await updateDoc(userRef, {
            predictionsUsed: currentCount + 1
        });
    }
}

/**
 * Reset daily predictions counter (should be called by a scheduled function)
 */
export async function resetDailyPredictions(uid: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        predictionsUsed: 0
    });
}

/**
 * Upgrade user to premium
 */
export async function upgradeToPremium(uid: string, subscriptionEndDate: Date): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        isPremium: true,
        subscriptionEnd: subscriptionEndDate,
        predictionsLimit: -1 // -1 means unlimited
    });
}

/**
 * Check if user can make a prediction
 */
export async function canMakePrediction(uid: string): Promise<{ canPredict: boolean; remaining: number }> {
    const profile = await getUserProfile(uid);

    if (!profile) {
        return { canPredict: false, remaining: 0 };
    }

    // Premium users have unlimited predictions
    if (profile.isPremium) {
        return { canPredict: true, remaining: -1 };
    }

    // Free users have daily limit
    const remaining = profile.predictionsLimit - profile.predictionsUsed;
    return {
        canPredict: remaining > 0,
        remaining: Math.max(0, remaining)
    };
}

/**
 * Get all users (Admin only)
 */
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function getAllUsers(): Promise<UserProfile[]> {
    if (!db) return [];

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(50)); // Limit to last 50 for performance
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: data.uid,
            email: data.email,
            isPremium: data.isPremium || false,
            subscriptionEnd: data.subscriptionEnd?.toDate(),
            predictionsUsed: data.predictionsUsed || 0,
            predictionsLimit: data.predictionsLimit || 3,
            favoriteTeams: data.favoriteTeams || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate() || new Date(),
            role: data.role || 'user'
        };
    });
}

/**
 * Set user role (Admin only)
 */
export async function setUserRole(uid: string, role: 'admin' | 'user'): Promise<void> {
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
}
