'use client';

import { useEffect, useState } from 'react';
import LiveEventsList from '@/components/LiveEventsList';
import { toast } from 'sonner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import Link from 'next/link';
import ParleyOptimizerBanner from '@/components/ai/ParleyOptimizerBanner';
import SportHeader from '@/components/sports/SportHeader';

export default function BasketballLivePage() {
    const [liveEvents, setLiveEvents] = useState<any[]>([]);
    const [scheduledEvents, setScheduledEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

    useEffect(() => {
        async function fetchAllEvents() {
            try {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

                const [liveRes, scheduledTodayRes, scheduledTomorrowRes] = await Promise.all([
                    fetch('/api/basketball/live'),
                    fetch(`/api/basketball/scheduled?date=${today}`),
                    fetch(`/api/basketball/scheduled?date=${tomorrow}`)
                ]);

                const liveData = await liveRes.json();
                const scheduledTodayData = await scheduledTodayRes.json();
                const scheduledTomorrowData = await scheduledTomorrowRes.json();

                if (liveData.success && liveData.data) setLiveEvents(liveData.data);

                let combinedScheduled: any[] = [];
                if (scheduledTodayData.success && scheduledTodayData.data?.events) {
                    combinedScheduled = [...scheduledTodayData.data.events];
                }
                if (scheduledTomorrowData.success && scheduledTomorrowData.data?.events) {
                    combinedScheduled = [...combinedScheduled, ...scheduledTomorrowData.data.events];
                }
                setScheduledEvents(combinedScheduled);

            } catch (err: any) {
                console.error("Error fetching events:", err);
                toast.error("Error al cargar eventos de baloncesto");
            } finally {
                setLoading(false);
            }
        }
        fetchAllEvents();
        const interval = setInterval(fetchAllEvents, 60000);
        return () => clearInterval(interval);
    }, []);

    const featuredMatch = liveEvents.length > 0 ? liveEvents[0] : scheduledEvents[0];

    let filteredEvents = [...liveEvents, ...scheduledEvents];
    if (filter === 'live') filteredEvents = liveEvents;
    else if (filter === 'upcoming') filteredEvents = scheduledEvents;

    return (
        <main className="min-h-screen pb-20 bg-[#050505] text-white selection:bg-orange-500/30">
            <SportHeader
                title="BALONCESTO"
                sport="BASKETBALL"
                emoji="🏀"
                color="from-orange-900/40 to-black"
                accentColor="bg-orange-500/5 blur-[120px]"
                subtitle="Court Insights • Live Scoring • Point Spread AI"
            />

            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Featured Top Analysis (Live or Next) */}
                    {featuredMatch && filter === 'all' && (
                        <div className="lg:col-span-8 mb-4">
                            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-black min-h-[350px] shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-purple-600/10 opacity-50"></div>
                                <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${featuredMatch.status.type === 'inprogress' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-orange-400'}`}>
                                            {featuredMatch.status.type === 'inprogress' ? 'En Vivo Ahora' : 'Próximo Análisis Top'}
                                        </span>
                                        <div className="text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                                            {featuredMatch.tournament.name}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-around py-8">
                                        <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/5 rounded-3xl p-4 mb-4 border border-white/5">
                                                <img src={`/api/proxy/team-logo/${featuredMatch.homeTeam.id}`} className="w-full h-full object-contain" alt="Home" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-black italic truncate max-w-[150px]">{featuredMatch.homeTeam.name}</h2>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter">
                                                {featuredMatch.status.type === 'inprogress' ?
                                                    `${featuredMatch.homeScore.current} - ${featuredMatch.awayScore.current}` :
                                                    'VS'
                                                }
                                            </div>
                                            {featuredMatch.status.type === 'inprogress' && (
                                                <div className="mt-2 text-[10px] font-black bg-orange-500 text-black px-3 py-1 rounded-full uppercase">
                                                    Q{featuredMatch.status.description}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/5 rounded-3xl p-4 mb-4 border border-white/5">
                                                <img src={`/api/proxy/team-logo/${featuredMatch.awayTeam.id}`} className="w-full h-full object-contain" alt="Away" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-black italic truncate max-w-[150px]">{featuredMatch.awayTeam.name}</h2>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/basketball-live/${featuredMatch.id}`}
                                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-center hover:bg-orange-500 hover:text-white transition-all duration-300"
                                    >
                                        Analizar Probabilidades ↗
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sidebar: Status & List Control */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-6 border border-white/10 rounded-[2rem] bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">ESTADO DEL ARENA</h3>
                            <div className="space-y-2">
                                {(['all', 'live', 'upcoming'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300
                                                ${filter === f
                                                ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
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

                        {/* Quick Insight Panel */}
                        <ParleyOptimizerBanner />
                    </div>

                    <div className="lg:col-span-12 mt-8">
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
                                                    sport="basketball"
                                                    title=""
                                                />
                                            </div>
                                        )}

                                        {/* SECTION 2: UPCOMING */}
                                        {scheduledEvents.filter(e => e.status.type === 'notstarted' || e.status.type === 'scheduled').length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                        <span className="w-3 h-8 bg-orange-500 rounded-full"></span>
                                                        📅 PRÓXIMOS PARTIDOS
                                                    </h2>
                                                </div>
                                                <LiveEventsList
                                                    events={scheduledEvents.filter(e => e.status.type === 'notstarted' || e.status.type === 'scheduled')}
                                                    sport="basketball"
                                                    title=""
                                                />
                                            </div>
                                        )}

                                        {/* SECTION 3: FINISHED */}
                                        {scheduledEvents.filter(e => e.status.type === 'finished').length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                        <span className="w-3 h-8 bg-gray-500 rounded-full"></span>
                                                        ✅ FINALIZADOS
                                                    </h2>
                                                </div>
                                                <LiveEventsList
                                                    events={scheduledEvents.filter(e => e.status.type === 'finished')}
                                                    sport="basketball"
                                                    title=""
                                                />
                                            </div>
                                        )}

                                        {filteredEvents.length === 0 && (
                                            <div className="glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]">
                                                <div className="text-9xl mb-8 opacity-5">🏀</div>
                                                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">No hay actividad en el tablero</p>
                                                <p className="text-gray-600 text-[10px] mt-4 uppercase">Explora mañana para más acción en la cancha</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Regular single list for specific filters
                                    <>
                                        <div className="flex items-center justify-between mb-8 px-2">
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                                <span className={`w-3 h-8 rounded-full ${filter === 'live' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                                {filter === 'live' ? '🔴 JUEGOS EN VIVO' : filter === 'upcoming' ? '📅 PRÓXIMOS' : 'JUEGOS'}
                                            </h2>
                                        </div>
                                        <LiveEventsList
                                            events={filteredEvents}
                                            sport="basketball"
                                            title=""
                                        />
                                        {filteredEvents.length === 0 && (
                                            <div className="glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]">
                                                <div className="text-9xl mb-8 opacity-5">🏀</div>
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

