// web/app/tennis/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import GroupedMatchesList from '@/components/sports/GroupedMatchesList';
import StatWidget from '@/components/sports/StatWidget';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { sportsDataService, type SportsDataEvent } from '@/lib/services/sportsDataService';
import PlayerPropsPredictor from '@/components/basketball/PlayerPropsPredictor';

export default function TennisPage() {
    const [games, setGames] = useState<SportsDataEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                // SofaScore uses 'tennis' for both ATP and WTA
                const allGames = await sportsDataService.getEventsBySport('tennis');
                setGames(allGames);
            } catch (error) {
                console.error('Error fetching tennis matches:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGames();
    }, []);

    return (
        <main className="min-h-screen pb-20 bg-[#050505] text-white">
            {/* Hero Section Sport */}
            <div className="relative h-64 overflow-hidden mb-12 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 to-black z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="container relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-green-500 rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-float">🎾</div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-px w-8 bg-green-500"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400">Inteligencia en Pista</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                TENIS <span className="text-green-500">ELITE COURT MASTERY</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-xs tracking-[0.4em] uppercase mt-2">Análisis de Precisión • Rastreador de Grand Slams • IA de Match Point</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        {/* Stats Grid Brutalist */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Partidos Hoy</div>
                                <div className="text-3xl font-black">{games.length}</div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Acierto Tenis</div>
                                <div className="text-3xl font-black text-green-500">81% <span className="text-xs">📈</span></div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Aces/Set</div>
                                <div className="text-3xl font-black">4.2</div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">ROI Neto</div>
                                <div className="text-3xl font-black text-green-500">+18.9%</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-3 mb-8">
                                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                                Match Point: Jornada Actual
                            </h3>
                            {loading ? (
                                <SkeletonLoader />
                            ) : games.length > 0 ? (
                                <GroupedMatchesList games={games} sport="tennis" />
                            ) : (
                                <div className="glass-card p-24 text-center border-dashed border-2 border-white/5 rounded-[3rem] bg-white/[0.01]">
                                    <div className="text-7xl mb-6 opacity-10">🎾</div>
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No hay partidos de tenis hoy</p>
                                    <p className="text-gray-600 text-xs mt-2">Vuelve más tarde para el análisis de los Grand Slams y ATP</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <PlayerPropsPredictor fixedSport="tennis" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
