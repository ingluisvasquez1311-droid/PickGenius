'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BasketballStats from '@/components/basketball/BasketballStats';
import Link from 'next/link';
import StatRadarChart from '@/components/charts/StatRadarChart';
import PeriodScoreChart from '@/components/charts/PeriodScoreChart';
import Navigation from '@/components/Navigation';
import PlayerStatsTable from '@/components/basketball/PlayerStatsTable';
import AIPredictionCard from '@/components/ai/AIPredictionCard';

import { API_URL } from '@/lib/api';

export default function BasketballGamePage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [gameDetails, setGameDetails] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [lineups, setLineups] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGameData() {
            try {
                setLoading(true);

                // Fetch game details, stats and lineups in parallel
                const [detailsRes, statsRes, lineupsRes] = await Promise.all([
                    fetch(`${API_URL}/api/sofascore/basketball/game/${eventId}`),
                    fetch(`${API_URL}/api/sofascore/basketball/game/${eventId}/stats`),
                    fetch(`${API_URL}/api/sofascore/basketball/game/${eventId}/lineups`)
                ]);

                if (!detailsRes.ok || !statsRes.ok) {
                    throw new Error('Error al cargar datos del partido');
                }

                const detailsData = await detailsRes.json();
                const statsData = await statsRes.json();
                const lineupsData = await lineupsRes.json();

                if (detailsData.success) {
                    setGameDetails(detailsData.data.event);
                }

                if (statsData.success) {
                    setStats(statsData.data);
                }

                if (lineupsData.success) {
                    setLineups(lineupsData.data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameData();

        // Auto-refresh cada 30 segundos para partidos en vivo
        const interval = setInterval(fetchGameData, 30000);

        return () => clearInterval(interval);
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando partido...</p>
                </div>
            </div>
        );
    }

    if (error || !stats || !gameDetails) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p className="text-xl mb-2">❌ Error</p>
                    <p className="text-sm">{error || 'No se pudieron cargar los datos'}</p>
                    <Link
                        href="/basketball-live"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Volver a la lista
                    </Link>
                </div>
            </div>
        );
    }

    // Preparar datos para el gráfico de radar
    const allPeriodStats = stats.periods.find((p: any) => p.period === 'ALL');
    const radarData = allPeriodStats ? [
        {
            label: 'FG%',
            home: parseFloat(allPeriodStats.scoring['Field goals']?.homeValue || 0),
            away: parseFloat(allPeriodStats.scoring['Field goals']?.awayValue || 0),
            fullMark: 100
        },
        {
            label: '3PT%',
            home: parseFloat(allPeriodStats.scoring['3 pointers']?.homeValue || 0),
            away: parseFloat(allPeriodStats.scoring['3 pointers']?.awayValue || 0),
            fullMark: 100
        },
        {
            label: 'FT%',
            home: parseFloat(allPeriodStats.scoring['Free throws']?.homeValue || 0),
            away: parseFloat(allPeriodStats.scoring['Free throws']?.awayValue || 0),
            fullMark: 100
        },
        {
            label: 'Rebotes',
            home: parseInt(allPeriodStats.rebounds['Rebounds']?.home || 0),
            away: parseInt(allPeriodStats.rebounds['Rebounds']?.away || 0),
            fullMark: 60
        },
        {
            label: 'Asistencias',
            home: parseInt(allPeriodStats.other['Assists']?.home || 0),
            away: parseInt(allPeriodStats.other['Assists']?.away || 0),
            fullMark: 40
        },
    ] : [];

    // Preparar datos para el gráfico de periodos
    const periodData = stats.periods
        .filter((p: any) => ['Q1', 'Q2', 'Q3', 'Q4', 'OT'].includes(p.period))
        .map((p: any) => ({
            name: p.period,
            home: parseInt(p.scoring['Points']?.home || 0),
            away: parseInt(p.scoring['Points']?.away || 0)
        }));

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-950 py-4 overflow-x-hidden">
                <div className="container mx-auto px-2 max-w-[1600px]">
                    <Link
                        href="/basketball-live"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 text-sm"
                    >
                        ← Volver
                    </Link>

                    {/* DASHBOARD GRID LAYOUT */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                        {/* COLUMNA IZQUIERDA: Jugadores Local (3 cols) */}
                        <div className="xl:col-span-3 order-2 xl:order-1">
                            {lineups && (
                                <PlayerStatsTable
                                    teamName={gameDetails.homeTeam.name}
                                    players={lineups.home.players}
                                />
                            )}
                        </div>

                        {/* COLUMNA CENTRAL: Stats Principales + IA (6 cols) */}
                        <div className="xl:col-span-6 order-1 xl:order-2 space-y-4">

                            {/* Predicción de IA (Prioridad Alta) */}
                            <AIPredictionCard eventId={eventId} sport="basketball" />

                            {/* Estadísticas Generales (Barras) */}
                            <BasketballStats
                                eventId={eventId}
                                homeTeam={gameDetails.homeTeam.name}
                                awayTeam={gameDetails.awayTeam.name}
                                stats={stats}
                            />

                            {/* Gráficos Visuales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {radarData.length > 0 && (
                                    <StatRadarChart
                                        homeTeam={gameDetails.homeTeam.name}
                                        awayTeam={gameDetails.awayTeam.name}
                                        stats={radarData}
                                    />
                                )}
                                {periodData.length > 0 && (
                                    <PeriodScoreChart
                                        homeTeam={gameDetails.homeTeam.name}
                                        awayTeam={gameDetails.awayTeam.name}
                                        periods={periodData}
                                    />
                                )}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Jugadores Visitante (3 cols) */}
                        <div className="xl:col-span-3 order-3 xl:order-3">
                            {lineups && (
                                <PlayerStatsTable
                                    teamName={gameDetails.awayTeam.name}
                                    players={lineups.away.players}
                                />
                            )}
                        </div>

                    </div>

                    <div className="mt-6 text-center pb-8">
                        <p className="text-xs text-gray-600">
                            {gameDetails.status.description} • Actualización en tiempo real
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
