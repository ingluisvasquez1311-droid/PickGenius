"use client";

import React, { createContext, useContext } from 'react';
import {
    ClerkProvider,
    useUser as useClerkUser,
    SignInButton as ClerkSignInButton,
    SignUpButton as ClerkSignUpButton,
    UserButton as ClerkUserButton,
    SignOutButton as ClerkSignOutButton
} from '@clerk/nextjs';

/**
 * A safe wrapper for Clerk. If the publishable key is missing or a fake one,
 * it provides a mock context to prevent components from crashing.
 */

const MockClerkContext = createContext<{
    isSignedIn: boolean;
    user: any;
    isLoaded: boolean;
}>({
    isSignedIn: false,
    user: null,
    isLoaded: true
});

// Helper to validate key existence
const hasValidClerkKey = () => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    return !!key && !key.includes('include');
};

const isClerkEnabled = hasValidClerkKey();

export function useUser() {
    const context = useContext(MockClerkContext);

    // Return mock context if Clerk is disabled
    if (!isClerkEnabled) return context;

    try {
        // Only call the clerk hook if env exists
        // eslint-disable-next-line
        const clerk = useClerkUser();
        return clerk;
    } catch (e) {
        return context;
    }
}

export function ClerkSafeProvider({ children, publishableKey }: { children: React.ReactNode, publishableKey: string }) {
    // Double check runtime prop just in case
    const isValid = isClerkEnabled && !!publishableKey && !publishableKey.includes('include');

    if (!isValid) {
        return (
            <MockClerkContext.Provider value={{ isSignedIn: false, user: null, isLoaded: true }}>
                {children}
            </MockClerkContext.Provider>
        );
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            {children}
        </ClerkProvider>
    );
}

// Re-export standard components as safe versions
export function SafeSignedIn({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useUser();
    if (!isSignedIn) return null;
    return <>{children}</>;
}

export function SafeSignedOut({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useUser();
    if (isSignedIn) return null;
    return <>{children}</>;
}

export function SafeSignInButton(props: any) {
    if (!isClerkEnabled) {
        return <div onClick={() => console.warn('Auth Disabled (No Key)')} style={{ cursor: 'pointer' }}>{props.children || 'Sign In'}</div>;
    }
    return <ClerkSignInButton {...props} />;
}

export function SafeSignUpButton(props: any) {
    if (!isClerkEnabled) {
        return <div onClick={() => console.warn('Auth Disabled (No Key)')} style={{ cursor: 'pointer' }}>{props.children || 'Sign Up'}</div>;
    }
    return <ClerkSignUpButton {...props} />;
}

export function SafeUserButton(props: any) {
    if (!isClerkEnabled) {
        return <div className="w-8 h-8 rounded-full bg-gray-700 border border-white/10" title="Mock User (Auth Disabled)" />;
    }
    return <ClerkUserButton {...props} />;
}

export function SafeSignOutButton(props: any) {
    if (!isClerkEnabled) {
        return <div onClick={() => console.warn('Auth Disabled (No Key)')} style={{ cursor: 'pointer' }}>{props.children || 'Sign Out'}</div>;
    }
    return <ClerkSignOutButton {...props} />;
}
