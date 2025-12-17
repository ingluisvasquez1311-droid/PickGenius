'use client';

import { useState } from 'react';
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

    const logoUrl = `https://api.sofascore.com/api/v1/team/${teamId}/image`;

    if (error) {
        // Fallback: Show team initial in a circle
        const initial = teamName.charAt(0).toUpperCase();
        return (
            <div
                className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-gray-600`}
            >
                <span className="text-white font-bold text-lg">{initial}</span>
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} ${className} relative`}>
            <Image
                src={logoUrl}
                alt={`${teamName} logo`}
                fill
                className="object-contain"
                onError={() => setError(true)}
                unoptimized // Sofascore images don't need Next.js optimization
            />
        </div>
    );
}
