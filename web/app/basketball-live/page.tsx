'use client';

import { useEffect, useState } from 'react';
import LiveEventsList from '@/components/LiveEventsList';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BasketballLivePage() {
    const [liveEvents, setLiveEvents] = useState<any[]>([]);
    const [scheduledEvents, setScheduledEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');

    useEffect(() => {
        async function fetchAllEvents() {
            try {
                setLoading(true);

                // Fetch in parallel
                const [liveRes, scheduledRes] = await Promise.all([
                    fetch('/api/basketball/live'),
                    fetch(`/api/basketball/scheduled?date=${new Date().toISOString().split('T')[0]}`)
                ]);

                const liveData = await liveRes.json();
                const scheduledData = await scheduledRes.json();

                // Process Live Events
                if (liveData.success && liveData.data) {
                    setLiveEvents(liveData.data);
                }

                // Process Scheduled Events
                if (scheduledData.success && scheduledData.data && scheduledData.data.events) {
                    setScheduledEvents(scheduledData.data.events);
                }

            } catch (err: any) {
                console.error("Error fetching events:", err);
                toast.error("Error al cargar eventos");
            } finally {
                setLoading(false);
            }
        }

        fetchAllEvents();
        const interval = setInterval(fetchAllEvents, 60000);
        return () => clearInterval(interval);
    }, []);

    // Featured Match Logic (First Live or First Upcoming)
    const featuredMatch = liveEvents.length > 0 ? liveEvents[0] : scheduledEvents[0];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-2 md:p-6 font-sans selection:bg-green-500/30">

            {/* Header / Stats Bar */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                        NBA<span className="text-green-500">.LIVE</span>
                    </h1>
                    <p className="text-gray-400 text-xs font-mono mt-1 tracking-widest uppercase">
                        Datos en Tiempo Real • IA Activada • Alta Frecuencia
                    </p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-green-400">{liveEvents.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black">En Vivo</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-white">{scheduledEvents.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black">Programados</div>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                    <div className="h-64 bg-gray-900 rounded-3xl col-span-2"></div>
                    <div className="h-64 bg-gray-900 rounded-3xl"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* SUPER HERO SECTION - Featured Match (Span 8) */}
                    {featuredMatch && (
                        <div className="lg:col-span-8 relative group overflow-hidden rounded-[2rem] border border-white/10 bg-black min-h-[400px]">
                            {/* Background Flair */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>

                            {/* Featured Content */}
                            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black tracking-widest border border-white/20 uppercase">
                                        {featuredMatch.status.type === 'inprogress' ? '🔥 Partido Destacado' : '⚡ Próximo Gran Partido'}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400 font-mono">Arena Garden</div>
                                        <div className="text-lg font-bold">{featuredMatch.tournament.name}</div>
                                    </div>
                                </div>

                                {/* Teams Faceoff */}
                                <div className="flex items-center justify-around my-8">
                                    {/* Home */}
                                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                        <img src={`https://images.weserv.nl/?url=${encodeURIComponent(`https://www.sofascore.com/api/v1/team/${featuredMatch.homeTeam.id}/image`)}`} className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" alt="Home" />
                                        <h2 className="text-2xl md:text-4xl font-black mt-4 tracking-tighter">{featuredMatch.homeTeam.name}</h2>
                                    </div>

                                    {/* VS / Score */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
                                            {featuredMatch.status.type === 'inprogress' ?
                                                `${featuredMatch.homeScore.current} - ${featuredMatch.awayScore.current}` :
                                                'VS'
                                            }
                                        </div>
                                        <div className="mt-2 px-4 py-1.5 bg-green-500 text-black font-black text-xs uppercase rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                                            {featuredMatch.status.description}
                                        </div>
                                    </div>

                                    {/* Away */}
                                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                                        <img src={`https://images.weserv.nl/?url=${encodeURIComponent(`https://www.sofascore.com/api/v1/team/${featuredMatch.awayTeam.id}/image`)}`} className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" alt="Away" />
                                        <h2 className="text-2xl md:text-4xl font-black mt-4 tracking-tighter">{featuredMatch.awayTeam.name}</h2>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
                                        <div className="text-[10px] text-gray-500 uppercase font-black">Probabilidad IA</div>
                                        <div className="text-xl font-bold text-green-400">76% Local</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
                                        <div className="text-[10px] text-gray-500 uppercase font-black">Momentum</div>
                                        <div className="text-xl font-bold text-blue-400">Alta</div>
                                    </div>
                                    <Link
                                        href={`/basketball-live/${featuredMatch.id}`}
                                        className="col-span-2 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors py-3 text-center flex items-center justify-center gap-2"
                                    >
                                        Ver Análisis Completo ↗
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SIDEBAR - Up Next List (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                        <div className="bg-[#111] rounded-[2rem] border border-white/10 p-6 flex-1 flex flex-col overflow-hidden">
                            <h3 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                Próximos Eventos
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {scheduledEvents.slice(0, featuredMatch === scheduledEvents[0] ? 5 : 6).map((event: any) => (
                                    <Link href={`/basketball-live/${event.id}`} key={event.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono text-xs text-gray-400 bg-black/40 px-2 py-1 rounded">
                                                {event.status.description}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter truncate w-32">
                                                    {event.tournament.category?.name ? `${event.tournament.category.name}: ` : ''}{event.tournament.name}
                                                </span>
                                                <span className="font-bold text-sm truncate w-32">{event.homeTeam.name}</span>
                                                <span className="font-bold text-sm text-gray-400 truncate w-32">{event.awayTeam.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-gray-600 group-hover:text-green-500 transition-colors">Odds &gt;</div>
                                    </Link>
                                ))}
                                {scheduledEvents.length === 0 && (
                                    <div className="text-center text-gray-600 text-sm py-10">No hay más partidos hoy</div>
                                )}
                            </div>
                        </div>

                        {/* Quick Action Ad */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] p-6 text-center transform hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="text-xs font-black uppercase tracking-widest opacity-75">Función Premium</div>
                            <div className="text-2xl font-black italic">🔓 DESBLOQUEAR VALUE BETS</div>
                        </div>
                    </div>

                    {/* FULL WIDTH - Live Grid (Span 12) */}
                    {liveEvents.length > 0 && (
                        <div className="lg:col-span-12 mt-4">
                            <h3 className="text-2xl font-black uppercase italic mb-6 pl-2 border-l-4 border-red-500">
                                En Vivo Ahora <span className="text-sm font-normal not-italic text-gray-500 ml-2">({liveEvents.length} eventos)</span>
                            </h3>
                            <LiveEventsList events={liveEvents} sport="basketball" title="" />
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
