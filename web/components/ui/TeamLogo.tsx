'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TeamLogoProps {
    teamId: number;
    teamName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function TeamLogo({ teamId, teamName, size = 'md', className = '' }: TeamLogoProps) {
    const [error, setError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    // Use our internal proxy endpoint
    const imgSrc = `/api/proxy/team-logo/${teamId}`;

    // Reset error when teamId changes
    useEffect(() => {
        setError(false);
    }, [teamId]);

    const handleImageError = () => {
        setError(true);
    };

    if (error) {
        // Fallback: Show team initial in a circle
        const initial = teamName ? teamName.charAt(0).toUpperCase() : '?';
        return (
            <div
                className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center border-2 border-purple-400/30 shadow-lg`}
            >
                <span className="text-white font-black text-lg">{initial}</span>
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} ${className} relative`}>
            <Image
                src={imgSrc}
                alt={`${teamName} logo`}
                fill
                className="object-contain"
                onError={handleImageError}
                unoptimized
            />
        </div>
    );
}
