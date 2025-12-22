import { db } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    increment
} from 'firebase/firestore';

export interface FavoritePlayer {
    id: number;
    name: string;
    sport: 'basketball' | 'baseball' | 'nhl' | 'tennis';
    team?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    isPremium: boolean;
    subscriptionEnd?: Date;
    predictionsUsed: number;
    predictionsLimit: number;
    favoriteTeams: string[];
    favoritePlayers: FavoritePlayer[];
    createdAt: Date;
    lastLogin: Date;
    role: 'admin' | 'user';
    bio?: string;
    phoneNumber?: string;
    preferences?: {
        notifications: boolean;
        theme: 'dark' | 'light';
        language: 'es' | 'en';
    };
    stats?: {
        horarios: number;
        resultados: number;
        anotadores: number;
        asistentes: number;
        rank: number;
        reputation: number;
        streak: string;
        longestStreak: string;
        winRate: number;
        vroi: number;
    };
}

export interface PredictionRecord {
    id?: string;
    uid: string;
    playerName: string;
    sport: string;
    propType: string;
    line: number;
    prediction: string;
    probability: number;
    confidence: string;
    reasoning: string;
    timestamp: any;
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
        favoritePlayers: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user', // Default role
        stats: {
            horarios: 0,
            resultados: 0,
            anotadores: 0,
            asistentes: 0,
            rank: 0,
            reputation: 0,
            streak: '0w',
            longestStreak: '0w',
            winRate: 0,
            vroi: 0
        }
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
    const role = data.role || 'user';

    return {
        uid: data.uid,
        email: data.email,
        // Admins are always premium
        isPremium: data.isPremium || role === 'admin',
        subscriptionEnd: data.subscriptionEnd?.toDate(),
        predictionsUsed: data.predictionsUsed || 0,
        predictionsLimit: data.predictionsLimit || 3,
        favoriteTeams: data.favoriteTeams || [],
        favoritePlayers: data.favoritePlayers || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
        role: role,
        stats: data.stats || {
            horarios: 0,
            resultados: 0,
            anotadores: 0,
            asistentes: 0,
            rank: 0,
            reputation: 0,
            streak: '0w',
            longestStreak: '0w',
            winRate: 0,
            vroi: 0
        }
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
 * Add a player to user's favorites
 */
export async function addFavoritePlayer(uid: string, player: FavoritePlayer): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        favoritePlayers: arrayUnion(player)
    });
}

/**
 * Remove a player from user's favorites
 */
export async function removeFavoritePlayer(uid: string, player: FavoritePlayer): Promise<void> {
    if (!db) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        favoritePlayers: arrayRemove(player)
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

    // Premium users and Admins have unlimited predictions
    if (profile.isPremium || profile.role === 'admin') {
        return { canPredict: true, remaining: -1 };
    }

    // Free users have daily limit (Fix applied)
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
            favoritePlayers: data.favoritePlayers || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate() || new Date(),
            role: data.role || 'user'
        };
    });
}

/**
 * Update user profile details
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) return;
    const userRef = doc(db, 'users', uid);

    // Convert Dates to Firestore timestamps if necessary
    const cleanedUpdates: any = { ...updates };
    if (updates.subscriptionEnd) cleanedUpdates.subscriptionEnd = updates.subscriptionEnd;

    await updateDoc(userRef, cleanedUpdates);
}

/**
 * Set user role (Admin only)
 */
export async function setUserRole(uid: string, role: 'admin' | 'user'): Promise<void> {
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
}

/**
 * Save an AI prediction to history
 */
import { addDoc } from 'firebase/firestore';

export async function savePrediction(uid: string, prediction: Omit<PredictionRecord, 'uid' | 'timestamp'>): Promise<void> {
    if (!db) return;

    const predictionsRef = collection(db, 'predictions');
    await addDoc(predictionsRef, {
        ...prediction,
        uid,
        timestamp: serverTimestamp()
    });

    // Update user stats and predictions count
    const userRef = doc(db, 'users', uid);

    // Determine target stat based on prediction type
    let statToIncrement = 'stats.resultados'; // Default

    if (prediction.playerName) {
        // It's a player prop
        if (prediction.propType?.toLowerCase().includes('assist') || prediction.prediction?.toLowerCase().includes('asist')) {
            statToIncrement = 'stats.asistentes';
        } else {
            statToIncrement = 'stats.anotadores';
        }
    } else if (prediction.sport === 'horarios') { // Hypothetical case
        statToIncrement = 'stats.horarios';
    }

    await updateDoc(userRef, {
        predictionsUsed: increment(1),
        [statToIncrement]: increment(1),
        'stats.reputation': increment(15) // Boost reputation for activity
    });
}

/**
 * Get user's prediction history
 */
import { where } from 'firebase/firestore';

export async function getUserPredictions(uid: string, limitCount: number = 20): Promise<PredictionRecord[]> {
    if (!db) return [];

    const predictionsRef = collection(db, 'predictions');
    const q = query(
        predictionsRef,
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as PredictionRecord,
        timestamp: (doc.data() as any).timestamp?.toDate() || new Date()
    }));
}
