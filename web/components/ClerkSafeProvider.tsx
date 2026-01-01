"use client";

import React, { createContext, useContext } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser as useClerkUser } from '@clerk/nextjs';

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

export function useUser() {
    const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('include');

    // We try to use Clerk if enabled, but useClerkUser might still throw if not wrapped
    try {
        const clerk = useClerkUser();
        if (isClerkEnabled) return clerk;
    } catch (e) {
        // Fallback to mock
    }

    return useContext(MockClerkContext);
}

export function ClerkSafeProvider({ children, publishableKey }: { children: React.ReactNode, publishableKey: string }) {
    const isClerkEnabled = publishableKey && !publishableKey.includes('include');

    if (!isClerkEnabled) {
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
