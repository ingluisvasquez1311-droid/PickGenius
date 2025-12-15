'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.png"
                            alt="PickGenius Logo"
                            width={35}
                            height={35}
                            className="rounded-lg"
                            priority
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                            PickGenius
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Link
                            href="/basketball-live"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                                ${isActive('/basketball-live')
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>🏀</span>
                            <span className="hidden sm:inline">Baloncesto</span>
                        </Link>
                        <Link
                            href="/football-live"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                                ${isActive('/football-live')
                                    ? 'bg-green-600/10 text-green-400'
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
                                <div className="flex items-center gap-4">
                                    <Link href="/profile" className="text-sm hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                            👤
                                        </div>
                                        {user.isPremium && <span className="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full border-2 border-gray-900"></span>}
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Link href="/auth/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                        Entrar
                                    </Link>
                                    <Link href="/auth/register" className="btn-primary text-sm px-4 py-2 rounded-lg font-bold">
                                        Unirse
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
