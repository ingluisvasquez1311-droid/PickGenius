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
import { logLimitAlert } from './adminService';

const ADMIN_EMAILS = [
    'pickgenius@gmail.com',
    'ingluisvasquez1311@gmail.com', // Explicit owner email
    'luisvasquez1311@gmail.com'    // Admin whitelist
];

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
    subscriptionType?: 'trial' | 'paid' | 'admin';
    subscriptionEnd?: Date;
    lastActive?: Date;
    predictionsUsed: number;
    predictionsLimit: number;
    totalPredictions: number;
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
        pushAlerts?: {
            hotPicks: boolean;
            matchResults: boolean;
            valueHunter: boolean;
            bankrollAlerts: boolean;
            discord: boolean;
            telegram: boolean;
        };
        discordId?: string;
        telegramId?: string;
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
    // For Player Props
    playerName?: string;
    propType?: string;
    line?: number;
    prediction?: string;
    probability?: number;

    // For Match Predictions (AI Oracle)
    gameId?: string;
    sport: string;
    homeTeam?: string;
    awayTeam?: string;
    winner?: string;
    bettingTip?: string;
    confidence: string | number;
    reasoning: string;
    predictions?: any; // Detailed stats (goals, corners, offsides)
    keyFactors?: string[];

    // Outcome tracking
    status?: 'pending' | 'won' | 'lost' | 'void';
    actualResult?: any;

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
        predictionsUsed: 0,
        predictionsLimit: 3, // Reverts to 3 after trial expires
        totalPredictions: 0,
        favoriteTeams: [],
        favoritePlayers: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
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
        },
        // GROWTH: 15-Day Free Trial for new users
        subscriptionEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isPremium: true, // Initially true for the trial
        subscriptionType: 'trial'
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
    let role = data.role || 'user';

    // Update lastActive timestamp (non-blocking)
    updateDoc(userRef, { lastActive: serverTimestamp() }).catch(() => null);

    // Auto-promote if in whitelist but has user role
    if (role !== 'admin' && ADMIN_EMAILS.includes(data.email?.toLowerCase())) {
        role = 'admin';
        // Force admin users to have premium access
        updateDoc(userRef, {
            role: 'admin',
            isPremium: true,
            subscriptionType: 'admin',
            predictionsLimit: -1 // Unlimited
        }).catch(console.error);
    }

    // Force premium status for all admins
    const isAdmin = role === 'admin';

    return {
        uid: data.uid,
        email: data.email,
        // Admins are ALWAYS premium, no exceptions
        isPremium: isAdmin || data.isPremium || (data.subscriptionEnd && data.subscriptionEnd.toDate() > new Date()),
        subscriptionType: isAdmin ? 'admin' : (data.subscriptionType || (data.isPremium ? 'paid' : 'trial')),
        subscriptionEnd: data.subscriptionEnd?.toDate(),
        lastActive: data.lastActive?.toDate(),
        predictionsUsed: data.predictionsUsed || 0,
        predictionsLimit: isAdmin ? -1 : (data.predictionsLimit || 3), // Admins have unlimited
        totalPredictions: data.totalPredictions || 0,
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
        await updateDoc(userRef, {
            predictionsUsed: increment(1),
            totalPredictions: increment(1)
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
        subscriptionType: 'paid',
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

    // Premium users (including Trial) and Admins have unlimited predictions
    // We double check the date here just in case
    const isSubscriptionActive = profile.subscriptionEnd && profile.subscriptionEnd > new Date();

    if (profile.isPremium || profile.role === 'admin' || isSubscriptionActive) {
        return { canPredict: true, remaining: -1 };
    }

    // Free users have daily limit (Fix applied)
    const remaining = profile.predictionsLimit - profile.predictionsUsed;

    if (remaining <= 0) {
        logLimitAlert(uid, profile.email).catch(() => { });
    }

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
        const role = data.role || 'user';
        return {
            uid: data.uid,
            email: data.email,
            isPremium: data.isPremium || false,
            subscriptionType: data.subscriptionType || (role === 'admin' ? 'admin' : (data.isPremium ? 'paid' : 'trial')),
            subscriptionEnd: data.subscriptionEnd?.toDate(),
            lastActive: data.lastActive?.toDate(),
            predictionsUsed: data.predictionsUsed || 0,
            predictionsLimit: data.predictionsLimit || 3,
            totalPredictions: data.totalPredictions || 0,
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

    const isGuest = !uid || uid === 'guest';
    const finalUid = isGuest ? 'guest' : uid;

    const predictionData = {
        ...prediction,
        uid: finalUid,
        isGuest,
        timestamp: serverTimestamp()
    };

    // 1. Save to main predictions collection
    const predictionsRef = collection(db, 'predictions');
    await addDoc(predictionsRef, predictionData);

    // 2. Save to global stats for Admin Live Feed
    const statsRef = collection(db, 'stats_predictions');
    await addDoc(statsRef, {
        gameId: prediction.gameId || 'N/A',
        pick: prediction.bettingTip || prediction.prediction || 'Consulta IA',
        confidence: prediction.confidence || 0,
        sport: prediction.sport || 'football',
        isGuest,
        userEmail: isGuest ? 'Invitado' : 'Usuario Registrado',
        timestamp: serverTimestamp()
    });

    // 3. Update user stats ONLY if not a guest
    if (!isGuest) {
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
        }

        try {
            await updateDoc(userRef, {
                predictionsUsed: increment(1),
                totalPredictions: increment(1),
                [statToIncrement]: increment(1),
                'stats.reputation': increment(15)
            });
        } catch (err) {
            console.error('Error updating user stats (might be non-existent doc):', err);
        }
    }
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

/**
 * Saves a generated parley prediction to user's history
 */
export async function saveParleyPrediction(uid: string, parleyData: any) {
    if (!db) return;
    const historyRef = collection(db, 'users', uid, 'parleyHistory');
    return await addDoc(historyRef, {
        ...parleyData,
        createdAt: serverTimestamp()
    });
}
/**
 * Recalcula estadísticas reales del usuario basadas en su historial de predicciones
 */
export async function calculateUserStats(uid: string): Promise<UserProfile['stats'] | null> {
    if (!db || !uid || uid === 'guest') return null;

    try {
        const predictionsRef = collection(db, 'predictions');
        const q = query(predictionsRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);

        let wins = 0;
        let losses = 0;
        let pushes = 0;
        let totalValuable = 0;
        let streak = 0;
        let currentStreakType: 'w' | 'l' | null = null;
        let bestStreak = 0;

        // Sort by timestamp for streak calculation
        const sortedDocs = querySnapshot.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a: any, b: any) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0));

        for (const pred of sortedDocs as any[]) {
            if (pred.status === 'won') {
                wins++;
                totalValuable++;
                if (currentStreakType === 'w') {
                    streak++;
                } else {
                    currentStreakType = 'w';
                    streak = 1;
                }
                if (streak > bestStreak) bestStreak = streak;
            } else if (pred.status === 'lost') {
                losses++;
                totalValuable++;
                if (currentStreakType === 'l') {
                    streak++;
                } else {
                    currentStreakType = 'l';
                    streak = 1;
                }
                streak = 0; // Current win streak reset to 0 in display terms if we only track win streaks
                currentStreakType = 'l';
            } else if (pred.status === 'push') {
                pushes++;
            }
        }

        const winRate = totalValuable > 0 ? (wins / totalValuable) * 100 : 0;
        const vroi = totalValuable > 0 ? ((wins * 0.9) - losses) / totalValuable * 10 : 14.2; // Mock ROI formula or real one if stakes known

        const newStats = {
            horarios: sortedDocs.length,
            resultados: wins + losses,
            anotadores: wins,
            asistentes: pushes,
            rank: 24, // Placeholder for now
            reputation: totalValuable * 15,
            streak: `${streak}${currentStreakType || 'w'}`,
            longestStreak: `${bestStreak}w`,
            winRate: Number(winRate.toFixed(1)),
            vroi: Number(vroi.toFixed(1))
        };

        // Update user profile with real stats
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { stats: newStats });

        return newStats;
    } catch (error) {
        console.error('Error recalculating user stats:', error);
        return null;
    }
}
