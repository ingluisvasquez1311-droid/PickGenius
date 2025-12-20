'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { type PredictionRecord } from '@/lib/userService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, loading, getHistory, signOut } = useAuth();
    const [history, setHistory] = useState<PredictionRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchHistory() {
            if (user) {
                try {
                    const data = await getHistory(10);
                    setHistory(data);
                } catch (error) {
                    console.error('Error al cargar el historial:', error);
                } finally {
                    setLoadingHistory(false);
                }
            }
        }
        if (user) fetchHistory();
    }, [user, getHistory]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) return null;

    const predictionsRemaining = user.isPremium ? '∞' : Math.max(0, user.predictionsLimit - user.predictionsUsed);
    const accountAge = Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            TU <span className="text-purple-500">PERFIL</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-xs tracking-widest uppercase mt-2">
                            Miembro durante {accountAge} días • AI Powered
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => signOut()}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar: Info & Stats (Span 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-8 border border-white/10 bg-gradient-to-br from-[#111] to-black rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all duration-700"></div>

                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Información de Cuenta</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Email</div>
                                    <div className="text-xl font-bold truncate">{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Estado de Membresía</div>
                                    <div className={`text-2xl font-black uppercase italic ${user.isPremium ? 'text-yellow-500' : 'text-purple-400'}`}>
                                        {user.isPremium ? '👑 PREMIUM' : '⚡ ESTÁNDAR'}
                                    </div>
                                </div>
                                {!user.isPremium && (
                                    <Link href="/pricing" className="block w-full text-center py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase text-xs rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        DESBLOQUEAR PREMIUM 💎
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-8 border border-white/10 bg-gradient-to-br from-[#111] to-black rounded-[2.5rem]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Uso de IA Hoy</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-3xl font-black text-white">{user.predictionsUsed}</div>
                                    <div className="text-[9px] text-gray-500 uppercase font-black mt-1">Usados</div>
                                </div>
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-3xl font-black text-green-400">
                                        {predictionsRemaining}
                                    </div>
                                    <div className="text-[9px] text-gray-500 uppercase font-black mt-1">Disponibles</div>
                                </div>
                            </div>
                            <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                                    style={{ width: `${user.isPremium ? 100 : Math.min(100, (user.predictionsUsed / user.predictionsLimit) * 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] text-gray-500 mt-3 text-center uppercase font-bold tracking-widest">
                                {user.isPremium ? 'Acceso ilimitado activado' : 'Límite diario: 3 predicciones'}
                            </p>
                        </div>
                    </div>

                    {/* Main Content: History (Span 8) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass-card p-8 md:p-10 border border-white/10 bg-gradient-to-br from-[#111] to-black rounded-[2.5rem] min-h-[500px]">
                            <h3 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-4">
                                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                                Historial de Análisis IA
                            </h3>

                            {loadingHistory ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-white/5 rounded-[1.5rem] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((item) => (
                                        <div key={item.id} className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all cursor-default">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-gray-500 font-mono font-bold uppercase bg-black/40 px-2 py-1 rounded">
                                                        {new Date(item.timestamp).toLocaleDateString('es-ES')}
                                                    </span>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${item.prediction.includes('MÁS') || item.prediction === 'OVER' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {item.prediction} {item.line}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Confianza</div>
                                                    <div className={`text-xs font-black uppercase ${item.confidence === 'Alta' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {item.confidence}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h4 className="text-xl font-black tracking-tight group-hover:text-purple-400 transition-colors uppercase italic">{item.playerName}</h4>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black mt-1 tracking-widest">
                                                        {item.sport} • {item.propType.toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] text-gray-600 font-black uppercase mb-1">Certeza IA</div>
                                                    <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-right">
                                                        {item.probability}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="text-7xl mb-6 opacity-20">📊</div>
                                    <p className="font-black uppercase tracking-[0.3em] text-gray-600 text-sm max-w-xs leading-relaxed">
                                        Aún no has generado análisis. Empieza a predecir en el panel de props.
                                    </p>
                                    <Link href="/props" className="mt-8 text-purple-500 font-black uppercase text-xs hover:underline tracking-widest">
                                        Ir al Panel de Props →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
