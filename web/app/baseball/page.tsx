// web/app/baseball/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import GroupedMatchesList from '@/components/sports/GroupedMatchesList';
import StatWidget from '@/components/sports/StatWidget';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { sportsDataService, type SportsDataEvent } from '@/lib/services/sportsDataService';
import PlayerPropsPredictor from '@/components/basketball/PlayerPropsPredictor';

export default function BaseballPage() {
    const [games, setGames] = useState<SportsDataEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                const allGames = await sportsDataService.getEventsBySport('baseball');
                setGames(allGames);
            } catch (error) {
                console.error('Error fetching baseball games:', error);
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
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-black z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="container relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-pulse">⚾</div>
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                BÉISBOL <span className="text-red-500">MLB</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-xs tracking-[0.4em] uppercase mt-2">Diamond Analytics • Pro Insights</p>
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
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Acierto MLB</div>
                                <div className="text-3xl font-black text-red-500">72% <span className="text-xs">📈</span></div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">HR Proyectados</div>
                                <div className="text-3xl font-black">12</div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-2">ROI Neto</div>
                                <div className="text-3xl font-black text-green-500">+12.1%</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-3 mb-8">
                                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                                Cartelera del Día
                            </h3>
                            {loading ? (
                                <SkeletonLoader />
                            ) : games.length > 0 ? (
                                <GroupedMatchesList games={games} sport="baseball" />
                            ) : (
                                <div className="glass-card p-24 text-center border-dashed border-2 border-white/5 rounded-[3rem] bg-white/[0.01]">
                                    <div className="text-7xl mb-6 opacity-10">⚾</div>
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No hay partidos de MLB hoy</p>
                                    <p className="text-gray-600 text-xs mt-2">Vuelve más tarde para el análisis de la siguiente jornada</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <PlayerPropsPredictor fixedSport="baseball" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
