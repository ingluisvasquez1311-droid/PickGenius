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
    const [retryCount, setRetryCount] = useState(0);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    // Lista de URLs para intentar en orden
    const sources = [
        `https://images.weserv.nl/?url=${encodeURIComponent(`https://api.sofascore.app/api/v1/team/${teamId}/image`)}`,
        `https://images.weserv.nl/?url=${encodeURIComponent(`https://www.sofascore.com/api/v1/team/${teamId}/image`)}`,
        `https://images.weserv.nl/?url=${encodeURIComponent(`https://api.sofascore.app/api/v1/player/${teamId}/image`)}` // Para Tenis
    ];

    const [imgSrc, setImgSrc] = useState(sources[0]);

    // Resetear cuando cambie el ID
    useEffect(() => {
        setImgSrc(sources[0]);
        setRetryCount(0);
        setError(false);
    }, [teamId]);

    const handleImageError = () => {
        if (retryCount < sources.length - 1) {
            const nextIndex = retryCount + 1;
            setImgSrc(sources[nextIndex]);
            setRetryCount(nextIndex);
        } else {
            setError(true);
        }
    };

    if (error) {
        // Fallback: Show team initial in a circle
        const initial = teamName ? teamName.charAt(0).toUpperCase() : '?';
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
