'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LiveSportSelector() {
    const pathname = usePathname();

    const sports = [
        { id: 'football', name: 'Fútbol', path: '/football-live', icon: '⚽', color: 'text-green-500', border: 'border-green-500' },
        { id: 'basketball', name: 'Basket', path: '/basketball-live', icon: '🏀', color: 'text-orange-500', border: 'border-orange-500' },
        { id: 'tennis', name: 'Tenis', path: '/tennis', icon: '🎾', color: 'text-yellow-500', border: 'border-yellow-500' },
        { id: 'baseball', name: 'Béisbol', path: '/baseball', icon: '⚾', color: 'text-red-500', border: 'border-red-500' },
        { id: 'american-football', name: 'NFL', path: '/american-football', icon: '🏈', color: 'text-orange-700', border: 'border-orange-700' },
        { id: 'ice-hockey', name: 'NHL', path: '/nhl', icon: '🏒', color: 'text-cyan-500', border: 'border-cyan-500' },
    ];

    return (
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-6">
            {sports.map((sport) => {
                const isActive = pathname === sport.path;
                return (
                    <Link
                        key={sport.id}
                        href={sport.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${isActive
                                ? `bg-white/10 ${sport.border} ${sport.color}`
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-lg">{sport.icon}</span>
                        <span className="text-xs font-black uppercase tracking-wider">{sport.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
