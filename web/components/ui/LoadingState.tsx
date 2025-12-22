'use client';

import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface LoadingStateProps {
    type?: 'skeleton' | 'spinner' | 'dots';
    message?: string;
    count?: number; // For skeleton repitition
    height?: string; // Custom height
}

export default function LoadingState({
    type = 'spinner',
    message,
    count = 1,
    height
}: LoadingStateProps) {

    if (type === 'skeleton') {
        return (
            <div className="w-full grid gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <SkeletonLoader key={i} className={height ? `h-[${height}]` : ''} />
                ))}
            </div>
        );
    }

    if (type === 'dots') {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
                {message && <p className="text-sm font-mono text-emerald-500/80 animate-pulse uppercase tracking-widest">{message}</p>}
            </div>
        );
    }

    // Default Spinner
    return (
        <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[200px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
            </div>
            {message && (
                <p className="mt-6 text-sm font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}
