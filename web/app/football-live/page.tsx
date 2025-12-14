'use client';

import { useEffect, useState } from 'react';
import LiveEventsList from '@/components/LiveEventsList';
import Navigation from '@/components/Navigation';



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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando partidos...</p>
                </div>
            </div>
        );
    }

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
            <Navigation />
            <div className="min-h-screen bg-gray-950 text-white p-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-green-500">
                    ⚽ Partidos de Fútbol en Vivo
                </h1>

                {error && (
                    <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded mb-4 text-center">
                        ⚠️ {error}
                    </div>
                )}

                {/* Filter Buttons - Split Left/Right */}
                <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                    {/* Left Side */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'all'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            📊 Todos ({events.length})
                        </button>
                        <button
                            onClick={() => setFilter('live')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'live'
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            🔴 EN VIVO ({events.filter(e => e.status.type === 'inprogress').length})
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'upcoming'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            📅 Próximos ({events.filter(e => e.status.type === 'notstarted').length})
                        </button>
                        <button
                            onClick={() => setFilter('finished')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'finished'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            ✅ Finalizados ({events.filter(e => e.status.type === 'finished').length})
                        </button>
                    </div>
                </div>

                {/* Filtered Events */}
                <LiveEventsList
                    events={filteredEvents}
                    sport="football"
                    title={title}
                />

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Actualización automática cada 60 segundos
                    </p>
                </div>
            </div>
        </>
    );
}
