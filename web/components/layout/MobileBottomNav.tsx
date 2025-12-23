'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Bot, Trophy, User, Ticket } from 'lucide-react';
import { useBettingSlip } from '@/contexts/BettingSlipContext';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { bets, toggleSlip } = useBettingSlip();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: 'Inicio', path: '/', icon: Home },
        { label: 'En Vivo', path: '/football-live', icon: Zap },
        { label: 'IA Picks', path: '/ai-picks', icon: Bot }, // Asumiendo ruta, si no existe redirige a home o una específica
        { label: 'Perfil', path: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-lg border-t border-white/10 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                {/* Standard Links */}
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Ticket Button (Special) */}
                <button
                    onClick={toggleSlip}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-300 relative group"
                >
                    <div className={`relative ${bets.length > 0 ? 'text-purple-500' : ''}`}>
                        <Ticket size={20} className={bets.length > 0 ? 'animate-pulse' : ''} />
                        {bets.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-[#050505]">
                                {bets.length}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] font-medium ${bets.length > 0 ? 'text-purple-500' : ''}`}>Ticket</span>
                </button>
            </div>
        </div>
    );
}
