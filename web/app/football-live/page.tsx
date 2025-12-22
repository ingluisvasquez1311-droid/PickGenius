'use client';

import { useEffect, useState } from 'react';
import LiveEventsList from '@/components/LiveEventsList';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ParleyOptimizerBanner from '@/components/ai/ParleyOptimizerBanner';

export default function FootballLivePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

    useEffect(() => {
        async function fetchLiveEvents() {
            try {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

                const [liveRes, scheduledTodayRes, scheduledTomorrowRes] = await Promise.all([
                    fetch('/api/football/live'),
                    fetch(`/api/football/scheduled?date=${today}`),
                    fetch(`/api/football/scheduled?date=${tomorrow}`)
                ]);

                const liveData = await liveRes.json();
                const scheduledTodayData = await scheduledTodayRes.json();
                const scheduledTomorrowData = await scheduledTomorrowRes.json();

                let allEvents: any[] = [];
                if (liveData.success && Array.isArray(liveData.data)) allEvents = [...liveData.data];

                const processScheduled = (data: any) => {
                    if (data.success && data.data && Array.isArray(data.data.events)) {
                        const scheduledEvents = data.data.events;
                        const liveIds = new Set(allEvents.map(e => e.id));
                        const newScheduled = scheduledEvents.filter((e: any) => !liveIds.has(e.id));
                        allEvents = [...allEvents, ...newScheduled];
                    }
                };

                processScheduled(scheduledTodayData);
                processScheduled(scheduledTomorrowData);

                setEvents(allEvents);
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLiveEvents();
        const interval = setInterval(fetchLiveEvents, 60000);
        return () => clearInterval(interval);
    }, []);

    let filteredEvents = events;
    let title = 'Fútbol: Hoy';

    if (filter === 'live') {
        filteredEvents = events.filter(e => e.status.type === 'inprogress');
        title = '🔴 EN VIVO AHORA';
    } else if (filter === 'upcoming') {
        filteredEvents = events.filter(e => e.status.type === 'notstarted');
        title = '📅 PRÓXIMOS EVENTOS';
    } else if (filter === 'finished') {
        filteredEvents = events.filter(e => e.status.type === 'finished');
        title = '✅ RESULTADOS';
    }

    return (
        <main className="min-h-screen pb-20 bg-[#050505] text-white selection:bg-green-500/30">
            {/* Hero Section Alusivo - Football */}
            <div className="relative h-64 md:h-80 overflow-hidden mb-12 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-black z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute top-0 right-0 w-[50%] h-full bg-green-500/5 blur-[120px] -z-10"></div>

                <div className="container relative z-10 w-full">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-float">⚽</div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-px w-8 bg-emerald-500"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Total Football Analytics</span>
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                FÚTBOL <span className="text-emerald-500">ELITE</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-xs tracking-[0.4em] uppercase mt-3">Stadium Vibes • Live Stats • Goal Prediction AI</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Sidebar: Filters & Stats */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="glass-card p-6 border border-white/10 rounded-[2rem] bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">FILTRAR ACCESOS</h3>
                            <div className="space-y-2">
                                {(['all', 'live', 'upcoming', 'finished'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300
                                                ${filter === f
                                                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                                            }`}
                                    >
                                        <span>{f === 'all' ? 'Todos' : f === 'live' ? 'En Vivo' : f === 'upcoming' ? 'Próximos' : 'Finalizados'}</span>
                                        {f === 'live' && events.filter(e => e.status.type === 'inprogress').length > 0 && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Panel */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Efectividad AI</div>
                                <div className="text-4xl font-black text-emerald-500 tracking-tighter">84%</div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-3xl">
                                <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Goles/Partido</div>
                                <div className="text-4xl font-black tracking-tighter">2.75</div>
                            </div>
                        </div>

                        {/* Parley Optimizer Banner */}
                        <ParleyOptimizerBanner />
                    </div>

                    {/* Main Match List */}
                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                <span className="w-3 h-8 bg-emerald-500 rounded-full"></span>
                                {title}
                            </h2>
                            <div className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 tracking-widest">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                                Live Sync: OK
                            </div>
                        </div>

                        {loading ? (
                            <SkeletonLoader />
                        ) : (
                            <div className="animate-in fade-in duration-700">
                                <LiveEventsList
                                    events={filteredEvents}
                                    sport="football"
                                    title=""
                                    loading={loading}
                                />
                                {filteredEvents.length === 0 && (
                                    <div className="glass-card p-32 text-center border-dashed border-2 border-white/5 rounded-[4rem] bg-white/[0.01]">
                                        <div className="text-9xl mb-8 opacity-5">⚽</div>
                                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">No se encontraron eventos</p>
                                        <p className="text-gray-600 text-[10px] mt-4 uppercase">Explora otras ligas o vuelve más tarde</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

