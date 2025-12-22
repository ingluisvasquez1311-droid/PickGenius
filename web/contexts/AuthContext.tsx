'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { type User } from 'firebase/auth';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    updateLastLogin,
    addFavoriteTeam,
    removeFavoriteTeam,
    incrementPredictionsUsed,
    canMakePrediction,
    savePrediction,
    getUserPredictions,
    type UserProfile,
    type PredictionRecord
} from '@/lib/userService';
import {
    subscribeToNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    type AppNotification
} from '@/lib/services/notificationService';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    addFavorite: (teamName: string) => Promise<void>;
    removeFavorite: (teamName: string) => Promise<void>;
    usePrediction: () => Promise<void>;
    checkPredictionLimit: () => Promise<{ canPredict: boolean; remaining: number }>;
    refreshUser: () => Promise<void>;
    getHistory: (limit?: number) => Promise<PredictionRecord[]>;
    saveToHistory: (prediction: Omit<PredictionRecord, 'uid' | 'timestamp'>) => Promise<void>;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    notifications: AppNotification[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    notify: (title: string, message: string, type?: AppNotification['type'], link?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);

    // ... (AuthContext definition)

    const loadUserProfile = async (firebaseUser: User) => {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email!;

        console.log(`👤 [Auth] Loading profile for ${uid}...`);
        try {
            // Try to get existing profile
            let profile = await getUserProfile(uid);

            // If profile doesn't exist, create it
            if (!profile) {
                console.log('👤 [Auth] Creating new profile...');
                profile = await createUserProfile(uid, email);
            } else if (!profile.stats) {
                // AUTO-REPAIR: Add missing stats for legacy profiles
                console.log('👤 [Auth] Legacy profile detected (missing stats). Repairing...');
                const defaultStats = {
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
                };
                await updateUserProfile(uid, { stats: defaultStats });
                profile.stats = defaultStats;
            } else {
                // Update last login
                console.log('👤 [Auth] Profile found, updating last login...');
                await updateLastLogin(uid);
            }

            console.log('👤 [Auth] Profile loaded successfully:', profile.role);
            // Merge Firebase Auth profile data not stored in Firestore
            setUser({
                ...profile,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined
            });
        } catch (error) {
            console.error('❌ [Auth] Error loading user profile:', error);
            // Fallback to basic user data
            setUser({
                uid,
                email,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined,
                isPremium: false,
                predictionsUsed: 0,
                predictionsLimit: 3,
                favoriteTeams: [],
                favoritePlayers: [],
                createdAt: new Date(),
                lastLogin: new Date(),
                role: 'user'
            });
        }
    };

    useEffect(() => {
        // Skip auth initialization if Firebase is not configured
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await loadUserProfile(firebaseUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase no está inicializado');
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase no está inicializado');
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) throw new Error('Firebase no está inicializado');
        await signInWithPopup(auth, googleProvider);
    };

    const signOut = async () => {
        if (!auth) throw new Error('Firebase no está inicializado');
        await firebaseSignOut(auth);
    };

    const addFavorite = async (teamName: string) => {
        if (!user) return;
        await addFavoriteTeam(user.uid, teamName);
        // Refresh user data
        await refreshUser();
    };

    const removeFavorite = async (teamName: string) => {
        if (!user) return;
        await removeFavoriteTeam(user.uid, teamName);
        // Refresh user data
        await refreshUser();
    };

    const usePrediction = async () => {
        if (!user) return;
        await incrementPredictionsUsed(user.uid);
        // Refresh user data
        await refreshUser();
    };

    const checkPredictionLimit = async () => {
        if (!user) return { canPredict: false, remaining: 0 };
        return await canMakePrediction(user.uid);
    };

    const refreshUser = async () => {
        if (!user) return;
        const profile = await getUserProfile(user.uid);
        if (profile) {
            setUser(profile);
        }
    };

    const getHistory = async (limitCount?: number) => {
        if (!user) return [];
        return await getUserPredictions(user.uid, limitCount);
    };

    const saveToHistory = async (prediction: Omit<PredictionRecord, 'uid' | 'timestamp'>) => {
        if (!user) return;
        await savePrediction(user.uid, prediction);
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        if (!user) return;
        const { updateUserProfile } = await import('@/lib/userService');
        await updateUserProfile(user.uid, updates);

        // Optimistic local update
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    const refreshNotifications = async () => {
        // Obsoleto: ahora usamos subscribeToNotifications en tiempo real
        console.log('🔔 [Auth] refreshNotifications es obsoleto, usando tiempo real.');
    };

    const markRead = async (id: string) => {
        await markAsRead(id);
        await refreshNotifications();
    };

    const markAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.uid);
        await refreshNotifications();
    };

    const notify = async (title: string, message: string, type: AppNotification['type'] = 'info', link?: string) => {
        if (!user) return;
        try {
            await createNotification(user.uid, { title, message, type, link });

            // Optimistic update for better UX
            const newNotif: AppNotification = {
                id: Math.random().toString(36).substr(2, 9),
                uid: user.uid,
                title,
                message,
                type,
                link,
                read: false,
                timestamp: new Date()
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Still refresh from server to get the real ID and server timestamp
            await refreshNotifications();
        } catch (error) {
            console.error('❌ [Auth] Error creating notification:', error);
        }
    };

    useEffect(() => {
        if (user) {
            console.log('🔔 [Auth] Estabilizando canal de notificaciones en tiempo real...');
            const unsubscribe = subscribeToNotifications(user.uid, (data: AppNotification[]) => {
                const unread = data.filter((n: AppNotification) => !n.read).length;
                console.log(`🔔 [Auth] Notificaciones actualizadas: ${data.length} totales, ${unread} sin leer`);
                setNotifications(data);
                setUnreadCount(unread);
            });
            return () => unsubscribe();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            addFavorite,
            removeFavorite,
            usePrediction,
            checkPredictionLimit,
            refreshUser,
            getHistory,
            saveToHistory,
            updateUser,
            notifications,
            unreadCount,
            refreshNotifications,
            markRead,
            markAllRead,
            notify
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
