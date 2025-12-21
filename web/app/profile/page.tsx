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
    const [activeTab, setActiveTab] = useState<'contributions' | 'predictions'>('predictions');
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
                    const data = await getHistory(20);
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
            <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) return null;

    // Mock Statistics for Layout
    const stats = {
        starts: 12,
        results: 8,
        goals: 0,
        assists: 3,
        rank: 94122,
        reputation: 50,
        streakCurrent: 3,
        streakMax: 8,
        classificationPosition: 24,
        points: 1250,
        correctPercentage: 75,
        roi: -0.64
    };

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-gray-200 p-4 md:p-6 lg:p-8 pt-24 font-sans text-sm">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN === */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-white/5">
                            <div className="bg-[#2a2a2a] p-4 flex justify-between items-center bg-[url('/header-pattern.png')] bg-cover relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                                <span className="relative z-10 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-yellow-500 border border-yellow-500/20">
                                    {user.isPremium ? 'Premium' : 'Colaborador'}
                                </span>
                                <span className="relative z-10 text-[10px] text-gray-400">
                                    Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-6 flex flex-col items-center -mt-8 relative z-10">
                                <div className="w-24 h-24 rounded-full border-4 border-[#1e1e1e] bg-gray-700 overflow-hidden shadow-2xl mb-4">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-purple-600 text-2xl font-bold text-white">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-white text-center mb-1">{user.displayName || user.email?.split('@')[0]}</h2>
                                <p className="text-gray-500 text-xs mb-6 text-center">{user.email}</p>

                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 py-1.5 rounded-lg border border-white/20 text-xs font-bold hover:bg-white/5 transition-colors">
                                        Editar
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/5 transition-colors text-gray-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Favorites */}
                        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5">
                            <h3 className="text-sm font-bold text-white mb-4">Favoritos</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] text-gray-500 uppercase font-black mb-2">Competiciones</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-[#252525] p-2 rounded-lg flex flex-col items-center gap-2 hover:bg-[#333] cursor-pointer transition-colors border border-white/5 hover:border-white/10">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">⚽</div>
                                            <span className="text-[10px] font-bold text-center">LaLiga</span>
                                        </div>
                                        <div className="bg-[#252525] p-2 rounded-lg flex flex-col items-center gap-2 hover:bg-[#333] cursor-pointer transition-colors border border-white/5 hover:border-white/10">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">🏀</div>
                                            <span className="text-[10px] font-bold text-center">NBA</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] text-gray-500 uppercase font-black mb-2">Equipos</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Mock Teams */}
                                        {['LAL', 'RMA', 'BAR'].map(team => (
                                            <div key={team} className="bg-[#252525] p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-[#333] cursor-pointer transition-colors border border-white/5 hover:border-white/10">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold">{team[0]}</div>
                                                <span className="text-[9px] text-gray-400 truncate w-full text-center">{team}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invite Banner */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Invita a tus amigos</h3>
                            <p className="text-xs text-blue-100 mb-4 relative z-10 leading-relaxed">
                                Comparte PickGenius con los aficionados al deporte de tu entorno.
                            </p>
                            <button className="w-full py-2 bg-black/30 backdrop-blur rounded-lg text-xs font-bold border border-white/20 hover:bg-black/40 transition-colors relative z-10 flex items-center justify-center gap-2">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Compartir enlace
                            </button>
                        </div>
                    </div>

                    {/* === CENTER COLUMN (MAIN) === */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('contributions')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'contributions' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                Contribuciones
                            </button>
                            <button
                                onClick={() => setActiveTab('predictions')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'predictions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                Predicciones IA
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#1e1e1e] p-4 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-xl font-black text-white">{stats.starts}</span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">Horarios</span>
                            </div>
                            <div className="bg-[#1e1e1e] p-4 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-xl font-black text-white">{stats.results}</span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">Resultados</span>
                            </div>
                            <div className="bg-[#1e1e1e] p-4 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-xl font-black text-white">{stats.goals}</span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">Anotadores</span>
                            </div>
                            <div className="bg-[#1e1e1e] p-4 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-xl font-black text-white">{stats.assists}</span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">Asistentes</span>
                            </div>
                        </div>

                        {/* Rank Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1e1e1e] py-6 px-4 rounded-xl flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                                <span className="text-2xl font-black text-white mb-1 relative z-10">{stats.rank}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider relative z-10">Posición en la Clasificación</span>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-xl"></div>
                            </div>
                            <div className="bg-[#1e1e1e] py-6 px-4 rounded-xl flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                                <span className="text-2xl font-black text-white mb-1 relative z-10">{stats.reputation}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider relative z-10">Puntuación de Reputación</span>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 blur-xl"></div>
                            </div>
                        </div>

                        {/* List / Feed */}
                        <div className="bg-[#1e1e1e] rounded-xl border border-white/5">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-white small-caps tracking-wide">Registro de {activeTab}</h3>
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                                </div>
                            </div>

                            <div className="p-2">
                                {loadingHistory ? (
                                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                                ) : activeTab === 'predictions' ? (
                                    history.length > 0 ? (
                                        <div className="space-y-1">
                                            {history.map((record, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer border-b border-white/5 last:border-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[#252525] border border-white/5 group-hover:border-primary/50 transition-colors">
                                                            <div className="text-xs font-bold text-gray-400 group-hover:text-white">{record.sport === 'football' ? '⚽' : '🏀'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                                                {record.playerName}
                                                                <span className={`text-[9px] px-1.5 rounded-sm border ${record.confidence === 'Alta' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'}`}>
                                                                    {record.confidence}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                                                <span className="font-mono">{record.prediction} {record.line}</span>
                                                                <span>•</span>
                                                                <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-white">{record.probability}%</div>
                                                        <div className="text-[9px] text-gray-600 font-bold uppercase">Probabilidad</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center text-gray-500">
                                            <div className="mb-2 text-3xl opacity-20">📉</div>
                                            No hay predicciones recientes.
                                            <br />
                                            <Link href="/props" className="text-primary hover:underline text-xs mt-3 inline-block font-bold uppercase tracking-widest">
                                                Comenzar a predecir
                                            </Link>
                                        </div>
                                    )
                                ) : (
                                    // Empty state for Contributions Tab
                                    <div className="p-12 text-center text-gray-500">
                                        <div className="mb-4 text-3xl opacity-20">✍️</div>
                                        <p className="text-sm">Aún no has contribuido a la comunidad.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN (WIDGETS) === */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Weekly Challenge */}
                        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-yellow-500/50 transition-colors group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-4 flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-2xl">
                                    🏆
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white">Desafío Semanal</h3>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Tiempo: 18h 39m</p>
                                </div>
                                <div className="text-gray-500 text-xs">GO &gt;</div>
                            </div>
                        </div>

                        {/* National Badge */}
                        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5 flex items-center justify-center gap-3 group cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="w-8 h-6 rounded bg-red-800 shadow-sm group-hover:scale-110 transition-transform"></div>
                            <span className="font-bold text-sm text-gray-200">National League</span>
                        </div>

                        {/* Streaks */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center min-h-[100px]">
                                <div className="text-xs text-blue-400 font-bold mb-1 flex items-center justify-center gap-1">
                                    <span className="animate-pulse">🔥</span> 3 weeks
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Racha actual</div>
                            </div>
                            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center min-h-[100px]">
                                <div className="text-xs text-purple-400 font-bold mb-1 flex items-center justify-center gap-1">
                                    ⚡ 8 weeks
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Racha más larga</div>
                            </div>
                        </div>

                        {/* Classification Widget */}
                        <div className="bg-[#1e1e1e] rounded-xl border border-white/5 p-5">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                    <h3 className="font-bold text-sm text-white">Clasificación</h3>
                                </div>
                                <Link href="#" className="text-[10px] text-blue-400 uppercase font-black hover:text-blue-300 transition-colors">Ver Todo</Link>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center mb-6">
                                <div>
                                    <div className="text-lg font-black text-white">{stats.classificationPosition}</div>
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">Posición</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white">{stats.correctPercentage}%</div>
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">Acierto</div>
                                </div>
                                <div>
                                    <div className={`text-lg font-black ${stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>{stats.roi}</div>
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">VROI</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🎯</div>
                                        <span className="text-xs text-gray-300 font-bold group-hover:text-white transition-colors">Top Pronosticadores</span>
                                    </div>
                                    <span className="text-[10px] text-blue-400 font-black">VER</span>
                                </div>
                                <div className="flex justify-between items-center cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs">⭐</div>
                                        <span className="text-xs text-gray-300 font-bold group-hover:text-white transition-colors">Top Colaboradores</span>
                                    </div>
                                    <span className="text-[10px] text-blue-400 font-black">VER</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
