'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

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
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                                PickGenius
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
                        </div>

                        {/* Auth */}
                        <div className="flex items-center gap-4">
                            {!loading && (
                                user ? (
                                    <div className="flex items-center gap-3">
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
