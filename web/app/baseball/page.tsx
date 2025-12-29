'use client';

import React, { useState, useMemo } from 'react';
import LiveEventsList from '@/components/LiveEventsList';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import PlayerPropsPredictor from '@/components/basketball/PlayerPropsPredictor';
import ParleyOptimizerBanner from '@/components/ai/ParleyOptimizerBanner';
import SportHeader from '@/components/sports/SportHeader';
import { useSportsEvents } from '@/lib/hooks/useSportsEvents';

export default function BaseballPage() {
    const { data: allEvents = [], isLoading: loading, error } = useSportsEvents('baseball');
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

    const { liveEvents, scheduledEvents } = useMemo(() => {
        return {
            liveEvents: allEvents.filter(e => e.status.type === 'inprogress'),
            scheduledEvents: allEvents.filter(e => e.status.type !== 'inprogress')
        };
    }, [allEvents]);

    let filteredEvents = [...liveEvents, ...scheduledEvents];
    if (filter === 'live') filteredEvents = liveEvents;
    else if (filter === 'upcoming') filteredEvents = scheduledEvents;

    return (
        <main className="min-h-screen pb-20 bg-[#050505] text-white selection:bg-red-500/30">
            <SportHeader
                title="MLB BÉISBOL"
                sport="BASEBALL"
                emoji="⚾"
                color="from-red-900/40 to-black"
                accentColor="bg-red-500/5 blur-[120px]"
                subtitle="Diamond Insights • Home Run Coverage • Pitcher AI"
            />

            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Filters & Stats */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="glass-card p-6 border border-white/10 rounded-[2rem] bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">FILTRAR EVENTOS</h3>
                            <div className="space-y-2">
                                {(['all', 'live', 'upcoming'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300
                                                ${filter === f
                                                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                                            }`}
                                    >
                                        <span>{f === 'all' ? 'Todos' : f === 'live' ? 'En Juego' : 'Programados'}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] opacity-50">{f === 'live' ? liveEvents.length : f === 'upcoming' ? scheduledEvents.length : liveEvents.length + scheduledEvents.length}</span>
                                            {f === 'live' && liveEvents.length > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Panel */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Efectividad AI</div>
                                <div className="text-4xl font-black text-red-500 tracking-tighter">72%</div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-1">HR Proyectados</div>
                                <div className="text-4xl font-black tracking-tighter">12</div>
                            </div>
                        </div>

                        {/* Parley Optimizer Banner */}
                        <ParleyOptimizerBanner />
                    </div>

                    {/* Main Match List */}
                    <div className="lg:col-span-9">
                        {loading ? (
                            <SkeletonLoader />
                        ) : (
                            <div className="space-y-12 animate-in fade-in duration-700">
                                {filter === 'all' ? (
                                    <>
                                        {/* SECTION 1: LIVE */}
                                        {liveEvents.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                        <span className="w-3 h-8 bg-red-500 rounded-full animate-pulse"></span>
                                                        🔴 EN VIVO AHORA
                                                    </h2>
                                                </div>
                                                <LiveEventsList
                                                    events={liveEvents}
                                                    sport="baseball"
                                                    title=""
                                                />
                                            </div>
                                        )}

                                        {/* SECTION 2: UPCOMING */}
                                        {scheduledEvents.filter(e => e.status.type === 'notstarted' || e.status.type === 'scheduled').length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                        <span className="w-3 h-8 bg-red-600 rounded-full"></span>
                                                        📅 PRÓXIMOS PARTIDOS
                                                    </h2>
                                                </div>
                                                <LiveEventsList
                                                    events={scheduledEvents.filter(e => e.status.type === 'notstarted' || e.status.type === 'scheduled')}
                                                    sport="baseball"
                                                    title=""
                                                />
                                            </div>
                                        )}

                                        {filteredEvents.length === 0 && (
                                            <div className="glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]">
                                                <div className="text-9xl mb-8 opacity-5">⚾</div>
                                                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">No hay actividad en el diamante</p>
                                                <p className="text-gray-600 text-[10px] mt-4 uppercase">Explora mañana para más acción</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-8 px-2">
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                <span className={`w-3 h-8 rounded-full ${filter === 'live' ? 'bg-red-500' : 'bg-red-600'}`}></span>
                                                {filter === 'live' ? '🔴 JUEGOS EN VIVO' : filter === 'upcoming' ? '📅 PRÓXIMOS' : 'JUEGOS'}
                                            </h2>
                                        </div>
                                        <LiveEventsList
                                            events={filteredEvents}
                                            sport="baseball"
                                            title=""
                                        />
                                        {filteredEvents.length === 0 && (
                                            <div className="glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]">
                                                <div className="text-9xl mb-8 opacity-5">⚾</div>
                                                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">No se encontraron eventos</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
