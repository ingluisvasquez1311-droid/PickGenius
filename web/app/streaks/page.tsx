'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Streak } from '@/lib/services/streakService';

export default function StreaksPage() {
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'goals'>('all');

    useEffect(() => {
        const fetchStreaks = async () => {
            try {
                const res = await fetch('/api/analytics/streaks');
                const json = await res.json();
                if (json.success) {
                    setStreaks(json.data);
                }
            } catch (error) {
                console.error('Failed to load streaks');
            } finally {
                setLoading(false);
            }
        };

        fetchStreaks();
    }, []);

    const filteredStreaks = streaks.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'goals') return s.type.includes('over_') || s.type === 'btts';
        return s.type === filter;
    });

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 pb-20 pt-24">
            <Navbar />

            {/* Header */}
            <header className="relative py-12 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Trend & Streak Analyzer
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                        STREAK <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">FINDER</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Detectamos equipos en racha: <span className="text-white font-bold">Victorias consecutivas</span>, sequías y tendencias de goles activas ahora mismo.
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="container mx-auto px-4 flex justify-center gap-2 mb-10 overflow-x-auto pb-4">
                {[
                    { id: 'all', label: 'Todas' },
                    { id: 'win', label: '🔥 Victorias' },
                    { id: 'loss', label: '🧊 Derrotas' },
                    { id: 'goals', label: '⚽ Goles' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${filter === f.id
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 max-w-5xl">
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-[#111] rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredStreaks.map((streak) => (
                            <StreakCard key={streak.id} streak={streak} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

const StreakCard = ({ streak }: { streak: Streak }) => {
    const isHot = streak.type === 'win' || streak.type.includes('over');

    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-white/20 transition-all">
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none ${isHot ? 'bg-orange-600' : 'bg-blue-600'}`}></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={streak.teamLogo} alt={streak.teamName} className="w-12 h-12 object-contain" />
                    <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <span>{streak.league}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{streak.sport}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white leading-none">{streak.teamName}</h3>
                        <p className="text-xs text-gray-400 mt-1">Último: {streak.lastMatch}</p>
                    </div>
                </div>

                <div className="text-center">
                    <div className={`text-4xl font-black italic tracking-tighter ${isHot ? 'text-orange-500' : 'text-blue-400'}`}>
                        {streak.count}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest leading-none">
                        {streak.type === 'win' && 'Victorias'}
                        {streak.type === 'loss' && 'Derrotas'}
                        {streak.type.includes('over') && 'Over 2.5'}
                        {streak.type === 'btts' && 'Ambos Marcan'}
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHot ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isHot ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono uppercase">Tendencia Activa</span>
                </div>
                <div className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white">
                    Confianza: {streak.confidenceScore}/10
                </div>
            </div>
        </div>
    );
};
