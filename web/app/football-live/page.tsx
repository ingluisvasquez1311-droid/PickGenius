'use client';

import { useEffect, useState } from 'react';
import LiveEventsList from '@/components/LiveEventsList';



export default function FootballLivePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

    useEffect(() => {
        async function fetchLiveEvents() {
            try {
                setLoading(true);
                const response = await fetch('/api/football/live');

                const data = await response.json();

                if (response.ok && data.success && Array.isArray(data.data)) {
                    // Detect data format (Sofascore or API-Sports)
                    const events = data.data.map((item: any) => {
                        // Sofascore Format (Native from Backend)
                        if (item.tournament && item.homeTeam && item.awayTeam) {
                            return {
                                id: item.id,
                                tournament: item.tournament,
                                homeTeam: item.homeTeam,
                                awayTeam: item.awayTeam,
                                homeScore: item.homeScore || { current: 0 },
                                awayScore: item.awayScore || { current: 0 },
                                status: item.status,
                                startTimestamp: item.startTimestamp
                            };
                        }

                        // API-Sports Format (Legacy/Fallback)
                        return {
                            id: item.fixture.id,
                            tournament: {
                                name: item.league.name,
                                uniqueTournament: { name: item.league.name }
                            },
                            homeTeam: {
                                id: item.teams.home.id,
                                name: item.teams.home.name
                            },
                            awayTeam: {
                                id: item.teams.away.id,
                                name: item.teams.away.name
                            },
                            homeScore: {
                                current: item.goals.home
                            },
                            awayScore: {
                                current: item.goals.away
                            },
                            status: {
                                type: item.fixture.status.short === 'NS' ? 'notstarted' :
                                    item.fixture.status.short === 'FT' ? 'finished' : 'inprogress',
                                description: item.fixture.status.long
                            },
                            startTimestamp: new Date(item.fixture.date).getTime() / 1000
                        };
                    });

                    setEvents(events);
                } else {
                    // API failed, use mock data
                    console.warn('API failed, using mock data. Error:', data.error);
                    const mockEvents = [
                        {
                            id: 1001,
                            tournament: { name: 'Premier League', uniqueTournament: { name: 'Premier League' } },
                            homeTeam: { id: 33, name: 'Manchester United' },
                            awayTeam: { id: 34, name: 'Newcastle' },
                            homeScore: { current: 2 },
                            awayScore: { current: 1 },
                            status: { type: 'inprogress', description: 'In Play' },
                            startTimestamp: Date.now() / 1000
                        },
                        {
                            id: 1002,
                            tournament: { name: 'La Liga', uniqueTournament: { name: 'La Liga' } },
                            homeTeam: { id: 541, name: 'Real Madrid' },
                            awayTeam: { id: 529, name: 'Barcelona' },
                            homeScore: { current: 0 },
                            awayScore: { current: 0 },
                            status: { type: 'notstarted', description: 'Not Started' },
                            startTimestamp: (Date.now() + 3600000) / 1000
                        }
                    ];
                    setEvents(mockEvents);
                    setError('Usando datos de demostración (API key pendiente)');
                }
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveEvents();

        // Auto-refresh cada 60 segundos
        const interval = setInterval(fetchLiveEvents, 60000);

        return () => clearInterval(interval);
    }, []);

    // Filter events based on selected filter
    let filteredEvents = events;
    let title = 'Todos los Partidos';

    if (filter === 'live') {
        filteredEvents = events.filter(e => e.status.type === 'inprogress');
        title = '🔴 EN VIVO AHORA';
    } else if (filter === 'upcoming') {
        filteredEvents = events.filter(e => e.status.type === 'notstarted');
        title = '📅 Próximos Partidos';
    } else if (filter === 'finished') {
        filteredEvents = events.filter(e => e.status.type === 'finished');
        title = '✅ Finalizados';
    }

    return (
        <>
            return (
            <>
                <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 bg-[url('/grid-pattern.svg')]">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-10 text-center relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 blur-[100px] -z-10" />
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                    Fútbol
                                </span>{' '}
                                En Vivo
                            </h1>
                            <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">
                                Resultados y Estadísticas en Tiempo Real
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl mb-8 text-center backdrop-blur-md">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 sticky top-20 z-30 bg-[#050505]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
                            {/* Left Side: Main Filters */}
                            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                {(['all', 'live', 'upcoming', 'finished'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`relative px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 uppercase
                                        ${filter === f
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {f === 'live' && (
                                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                        )}
                                        {f === 'all' ? 'Todos' : f === 'live' ? 'En Vivo' : f === 'upcoming' ? 'Próximos' : 'Finalizados'}
                                    </button>
                                ))}
                            </div>

                            {/* Right Side: Stats (Optional) */}
                            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    {events.filter(e => e.status.type === 'inprogress').length} EN JUEGO
                                </div>
                            </div>
                        </div>

                        {/* Filtered Events */}
                        <LiveEventsList
                            events={filteredEvents}
                            sport="football"
                            title={title}
                            loading={loading}
                        />

                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-gray-500">
                                <div className="w-2 h-2 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ACTUALIZACIÓN EN TIEMPO REAL
                            </div>
                        </div>
                    </div>
                </div>
            </>
            );
        </>
    );
}
