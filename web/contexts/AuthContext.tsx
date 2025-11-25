'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
    uid: string;
    email: string;
    isPremium: boolean;
    subscriptionEnd?: Date;
    predictionsUsed: number;
    createdAt: Date;
}

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
await createUserWithEmailAndPassword(auth, email, password);
    };

const signOut = async () => {
    await firebaseSignOut(auth);
};

return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
