'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Cargando perfil...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    const predictionsRemaining = user.isPremium ? '∞' : `${user.predictionsLimit - user.predictionsUsed}/${user.predictionsLimit}`;
    const accountAge = Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <main className="min-h-screen pb-20 pt-24">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                Mi Perfil
                            </h1>
                            <p className="text-[var(--text-muted)]">{user.email}</p>
                        </div>
                        {user.isPremium ? (
                            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black px-6 py-3 rounded-lg font-bold text-lg">
                                👑 PREMIUM
                            </div>
                        ) : (
                            <Link href="#upgrade" className="btn-primary px-6 py-3 rounded-lg font-bold">
                                Actualizar a Premium
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass-card p-6">
                        <div className="text-[var(--text-muted)] text-sm mb-2">Predicciones Hoy</div>
                        <div className="text-3xl font-bold text-[var(--primary)]">{predictionsRemaining}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                            {user.isPremium ? 'Ilimitadas' : `${user.predictionsUsed} usadas`}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="text-[var(--text-muted)] text-sm mb-2">Equipos Favoritos</div>
                        <div className="text-3xl font-bold text-[var(--accent)]">{user.favoriteTeams.length}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Siguiendo</div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="text-[var(--text-muted)] text-sm mb-2">Miembro desde</div>
                        <div className="text-3xl font-bold text-[var(--secondary)]">{accountAge}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">días</div>
                    </div>
                </div>

                {/* Favorite Teams */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Equipos Favoritos</h2>
                    {user.favoriteTeams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {user.favoriteTeams.map((team) => (
                                <div
                                    key={team}
                                    className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] p-4 rounded-lg border border-[rgba(255,255,255,0.1)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-lg font-bold">
                                            {team.substring(0, 1)}
                                        </div>
                                        <span className="font-medium">{team}</span>
                                    </div>
                                    <span className="text-xl">⭐</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            <p className="mb-4">No tienes equipos favoritos aún</p>
                            <Link href="/nba" className="text-[var(--primary)] hover:underline">
                                Explora partidos de NBA →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Premium Upgrade Section */}
                {!user.isPremium && (
                    <div id="upgrade" className="glass-card p-8 border-2 border-[var(--primary)]">
                        <div className="text-center">
                            <div className="text-5xl mb-4">👑</div>
                            <h2 className="text-3xl font-bold mb-2">Actualiza a Premium</h2>
                            <p className="text-[var(--text-muted)] mb-6">
                                Desbloquea predicciones ilimitadas y funciones exclusivas
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <div className="font-bold">Predicciones Ilimitadas</div>
                                        <div className="text-sm text-[var(--text-muted)]">Sin límites diarios</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <div className="font-bold">Análisis AI Avanzado</div>
                                        <div className="text-sm text-[var(--text-muted)]">Predicciones más precisas</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🧙‍♂️</span>
                                    <div>
                                        <div className="font-bold">Consejos del Mago</div>
                                        <div className="text-sm text-[var(--text-muted)]">Acceso prioritario</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <div className="font-bold">Estadísticas Avanzadas</div>
                                        <div className="text-sm text-[var(--text-muted)]">Datos históricos completos</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="text-5xl font-bold text-[var(--primary)] mb-2">$5<span className="text-2xl text-[var(--text-muted)]">/mes</span></div>
                                <div className="text-sm text-[var(--text-muted)]">Cancela cuando quieras</div>
                            </div>

                            <button className="btn-primary px-8 py-4 rounded-lg font-bold text-lg">
                                Comenzar Prueba Gratis
                            </button>
                            <p className="text-xs text-[var(--text-muted)] mt-3">
                                7 días gratis, luego $5/mes
                            </p>
                        </div>
                    </div>
                )}

                {/* Account Info */}
                <div className="glass-card p-6 mt-6">
                    <h2 className="text-xl font-bold mb-4">Información de la Cuenta</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.1)]">
                            <span className="text-[var(--text-muted)]">Email</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.1)]">
                            <span className="text-[var(--text-muted)]">Plan</span>
                            <span className="font-bold">{user.isPremium ? 'Premium' : 'Gratis'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.1)]">
                            <span className="text-[var(--text-muted)]">Miembro desde</span>
                            <span>{user.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-[var(--text-muted)]">Último acceso</span>
                            <span>{user.lastLogin.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
