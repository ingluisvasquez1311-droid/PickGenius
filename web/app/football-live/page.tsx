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
                const response = await fetch(`/api/sofascore/football/live`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Error: ${response.status}`);
                }

                if (data.success) {
                    setEvents(data.data);
                } else {
                    setError(data.error || 'Error desconocido');
                }
            } catch (err: any) {
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p className="text-xl mb-2">❌ Error</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Reintentar
                    </button>
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
                    Partidos de Fútbol en Vivo
                </h1>

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
