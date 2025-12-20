'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    createUserProfile,
    getUserProfile,
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
    getUserNotifications,
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
    signOut: () => Promise<void>;
    addFavorite: (teamName: string) => Promise<void>;
    removeFavorite: (teamName: string) => Promise<void>;
    usePrediction: () => Promise<void>;
    checkPredictionLimit: () => Promise<{ canPredict: boolean; remaining: number }>;
    refreshUser: () => Promise<void>;
    getHistory: (limit?: number) => Promise<PredictionRecord[]>;
    saveToHistory: (prediction: Omit<PredictionRecord, 'uid' | 'timestamp'>) => Promise<void>;
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

    const loadUserProfile = async (uid: string, email: string) => {
        try {
            // Try to get existing profile
            let profile = await getUserProfile(uid);

            // If profile doesn't exist, create it
            if (!profile) {
                profile = await createUserProfile(uid, email);
            } else {
                // Update last login
                await updateLastLogin(uid);
            }

            setUser(profile);
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to basic user data
            setUser({
                uid,
                email,
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
                await loadUserProfile(firebaseUser.uid, firebaseUser.email!);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase not initialized');
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase not initialized');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Profile will be created automatically by onAuthStateChanged
    };

    const signOut = async () => {
        if (!auth) throw new Error('Firebase not initialized');
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

    const refreshNotifications = async () => {
        if (!user) return;
        const data = await getUserNotifications(user.uid);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
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
        await createNotification(user.uid, { title, message, type, link });
        await refreshNotifications();
    };

    useEffect(() => {
        if (user) {
            refreshNotifications();
            // Polling opcional cada 2 min para notificaciones
            const interval = setInterval(refreshNotifications, 120000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signOut,
            addFavorite,
            removeFavorite,
            usePrediction,
            checkPredictionLimit,
            refreshUser,
            getHistory,
            saveToHistory,
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
