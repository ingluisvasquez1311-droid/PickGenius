'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isActive = (path: string) => pathname.startsWith(path);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    // Scroll Down -> Hide
                    setIsVisible(false);
                } else {
                    // Scroll Up -> Show
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-5xl bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo.png"
                                alt="PickGenius Logo"
                                width={32}
                                height={32}
                                className="rounded-lg"
                                priority
                            />
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block relative">
                                PickGenius
                                <span className="absolute -top-3 -right-6 text-[8px] bg-red-600 text-white px-1 rounded animate-pulse font-mono tracking-widest border border-red-400">XMAS</span>
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-1 md:gap-4">
                            <Link
                                href="/basketball-live"
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive('/basketball-live')
                                        ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>🏀</span>
                                <span className="hidden sm:inline">Baloncesto</span>
                            </Link>
                            <Link
                                href="/football-live"
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive('/football-live')
                                        ? 'bg-green-600/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>⚽</span>
                                <span className="hidden sm:inline">Fútbol</span>
                            </Link>
                            <Link
                                href="/value-bets"
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive('/value-bets')
                                        ? 'bg-emerald-600/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>💎</span>
                                <span className="hidden sm:inline">Value Bets</span>
                            </Link>
                            <Link
                                href="/streaks"
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive('/streaks')
                                        ? 'bg-orange-600/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>🔥</span>
                                <span className="hidden sm:inline">Rachas</span>
                            </Link>
                            <Link
                                href="/props"
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                                    ${isActive('/props')
                                        ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>🎯</span>
                                <span className="hidden sm:inline">Props</span>
                            </Link>

                            {/* Otros Deportes Dropdown */}
                            <div className="relative group px-4 py-2 text-gray-400 hover:text-white cursor-pointer transition-all flex items-center gap-2">
                                <span>➕</span>
                                <span className="hidden md:inline text-sm font-medium uppercase tracking-tighter">Otros</span>
                                <div className="absolute top-full left-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50">
                                    <Link href="/american-football" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold">
                                        <span>🏈</span> NFL (FÚTBOL AM.)
                                    </Link>
                                    <Link href="/baseball" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold">
                                        <span>⚾</span> BÉISBOL (MLB)
                                    </Link>
                                    <Link href="/nhl" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold">
                                        <span>🏒</span> HOCKEY (NHL)
                                    </Link>
                                    <Link href="/tennis" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold">
                                        <span>🎾</span> TENIS (ATP)
                                    </Link>
                                </div>
                            </div>


                        </div>

                        {/* Auth */}
                        <div className="flex items-center gap-4">
                            {!loading && (
                                user ? (
                                    <div className="flex items-center gap-3">
                                        {user.role === 'admin' && (
                                            <Link href="/admin" className="text-red-400 text-xs font-bold border border-red-500/30 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 transition-colors">
                                                ADMIN
                                            </Link>
                                        )}
                                        <NotificationCenter />
                                        <Link href="/profile" className="text-sm hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 hover:border-purple-500 transition-colors">
                                                👤
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link href="/auth/register" className="btn-primary text-xs md:text-sm px-5 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all">
                                            Unirse
                                        </Link>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
