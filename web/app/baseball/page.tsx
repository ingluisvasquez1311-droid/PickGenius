// web/app/baseball/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import StatWidget from '@/components/sports/StatWidget';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { sofascoreService, type SofascoreEvent } from '@/lib/services/sofascoreService';
import PlayerPropsPredictor from '@/components/basketball/PlayerPropsPredictor';

export default function BaseballPage() {
    const [games, setGames] = useState<SofascoreEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                const allGames = await sofascoreService.getEventsBySport('baseball');
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
        <main className="min-h-screen pb-20 bg-[#0b0b0b]">
            <div className="container pt-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">⚾</div>
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">BÉISBOL MLB</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.3em]">ANÁLISIS PROFESIONAL • DIAMOND INSIGHTS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatWidget label="Partidos Hoy" value={games.length.toString()} icon="⚾" />
                            <StatWidget label="Acierto MLB" value="72%" trend="up" color="#ef4444" />
                            <StatWidget label="HR Proyectados" value="12" icon="🚀" />
                            <StatWidget label="ROI" value="+12.1%" trend="up" />
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <SkeletonLoader />
                            ) : games.length > 0 ? (
                                games.map(game => (
                                    <MatchCard
                                        key={game.id}
                                        eventId={game.id}
                                        sport="baseball"
                                        homeTeam={{ name: game.homeTeam.name, id: game.homeTeam.id }}
                                        awayTeam={{ name: game.awayTeam.name, id: game.awayTeam.id }}
                                        homeScore={game.homeScore.current}
                                        awayScore={game.awayScore.current}
                                        date={new Date(game.startTimestamp * 1000).toISOString()}
                                        status={game.status.type === 'inprogress' ? 'En Vivo' : game.status.type === 'finished' ? 'Finalizado' : 'Programado'}
                                        league={`${game.tournament.category?.name || 'Internacional'}: ${game.tournament.name}`}
                                    />
                                ))
                            ) : (
                                <div className="glass-card p-20 text-center border-dashed border-2 border-white/5">
                                    <span className="text-6xl mb-4 block opacity-20">⚾</span>
                                    <p className="text-[var(--text-muted)] font-black uppercase">No hay partidos de MLB hoy</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <PlayerPropsPredictor />
                    </div>
                </div>
            </div>
        </main>
    );
}
