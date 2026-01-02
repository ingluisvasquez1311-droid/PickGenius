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
    const context = useContext(MockClerkContext);
    const isClerkEnabled = typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('include');

    // Return mock context if Clerk is disabled
    if (!isClerkEnabled) return context;

    try {
        // Only call the clerk hook if env exists
        const clerk = useClerkUser();
        return clerk;
    } catch (e) {
        return context;
    }
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

export function SafeSignInButton(props: any) {
    const isClerkEnabled = typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('include');

    if (!isClerkEnabled) {
        return <div onClick={() => console.warn('Auth Disabled')} style={{ cursor: 'pointer' }}>{props.children || 'Sign In'}</div>;
    }
    const { SignInButton } = require('@clerk/nextjs');
    return <SignInButton {...props} />;
}

export function SafeSignUpButton(props: any) {
    const isClerkEnabled = typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('include');

    if (!isClerkEnabled) {
        return <div onClick={() => console.warn('Auth Disabled')} style={{ cursor: 'pointer' }}>{props.children || 'Sign Up'}</div>;
    }
    const { SignUpButton } = require('@clerk/nextjs');
    return <SignUpButton {...props} />;
}

export function SafeUserButton(props: any) {
    const isClerkEnabled = typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('include');

    if (!isClerkEnabled) {
        return <div className="w-8 h-8 rounded-full bg-gray-700 border border-white/10" title="Mock User (Auth Disabled)" />;
    }
    const { UserButton } = require('@clerk/nextjs');
    return <UserButton {...props} />;
}
