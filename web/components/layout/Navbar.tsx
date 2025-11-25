'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const { user, signOut, loading } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[rgba(255,255,255,0.1)]">
            <div className="container flex justify-between items-center py-4">
                <Link href="/" className="text-2xl font-bold">
                    Pick<span className="text-gradient">Genius</span>
                </Link>

                <div className="flex gap-6 items-center">
                    <Link href="/nba" className="hover:text-[var(--primary)] transition-colors">🏀 NBA</Link>
                    <Link href="/football" className="hover:text-[var(--primary)] transition-colors">⚽ Fútbol</Link>

                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[var(--text-muted)]">
                                    {user.email}
                                    {user.isPremium && <span className="ml-2 text-xs bg-[var(--primary)] text-black px-2 py-1 rounded font-bold">PREMIUM</span>}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm hover:text-[var(--danger)] transition-colors"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link href="/auth/login" className="text-sm hover:text-[var(--primary)] transition-colors">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2 rounded">
                                    Registrarse
                                </Link>
                            </div>
                        )
                    )}
                </div>

                <span className="text-xs text-[var(--text-muted)]">v2.0</span>
            </div>
        </nav>
    );
}
