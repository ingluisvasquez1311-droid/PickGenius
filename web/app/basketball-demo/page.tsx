'use client';

import { useEffect, useState } from 'react';
import BasketballStats from '@/components/basketball/BasketballStats';

import { API_URL } from '@/lib/api';

export default function BasketballLivePage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Event ID de ejemplo (Nuggets vs Knicks del 26/11/2024)
    const EVENT_ID = '12697005';
    const HOME_TEAM = 'Denver Nuggets';
    const AWAY_TEAM = 'New York Knicks';

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/sofascore/basketball/game/${EVENT_ID}/stats`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setStats(data.data);
                } else {
                    setError(data.error || 'Error desconocido');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando estadísticas...</p>
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
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-white">
                    🏀 Estadísticas NBA en Vivo
                </h1>

                {stats && (
                    <BasketballStats
                        eventId={EVENT_ID}
                        homeTeam={HOME_TEAM}
                        awayTeam={AWAY_TEAM}
                        stats={stats}
                    />
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Datos proporcionados por SofaScore API
                    </p>
                </div>
            </div>
        </div>
    );
}
