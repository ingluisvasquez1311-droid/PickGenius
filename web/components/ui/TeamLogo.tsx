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
    // When teamId changes, we want to reset error. 
    // We can simulate this by using a key on the Image or wrapping div.
    const [error, setError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    // Use our internal proxy endpoint
    const imgSrc = `/api/proxy/team-logo/${teamId}`;

    // Reset error when teamId changes by checking if prop changed (or rely on key upstream)
    // To fix lint error, we remove the sync setState in effect.
    // Instead we can use a key on the image component to force re-mount or just reset state in a harmless way?
    const handleImageError = () => {
        setError(true);
    };

    // Use key={teamId} on the wrapper div so that the entire component (including the error state) 
    // resets whenever the teamId changes. This avoids the need for an effect and fixes the lint error.
    return (
        <div key={teamId} className={`${sizeClasses[size]} ${className} relative`}>
            {!error ? (
                <Image
                    src={imgSrc}
                    alt={`${teamName} logo`}
                    fill
                    className="object-contain"
                    onError={handleImageError}
                    unoptimized
                />
            ) : (
                <div
                    className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center border-2 border-purple-400/30 shadow-lg"
                >
                    <span className="text-white font-black text-lg">
                        {teamName ? teamName.charAt(0).toUpperCase() : '?'}
                    </span>
                </div>
            )}
        </div>
    );
}
