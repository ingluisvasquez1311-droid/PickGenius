'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FootballStats from '@/components/football/FootballStats';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import PossessionChart from '@/components/charts/PossessionChart';
import AIPredictionCard from '@/components/ai/AIPredictionCard';
import FootballPlayerStatsTable from '@/components/football/FootballPlayerStatsTable';
import MatchPlayerStats from '@/components/sports/MatchPlayerStats';
import IncidentsTimeline from '@/components/football/IncidentsTimeline';
import HeadToHead from '@/components/football/HeadToHead';
import StandingsTable from '@/components/football/StandingsTable';
import TopPerformers from '@/components/football/TopPerformers';
import { API_URL } from '@/lib/api';

export default function FootballGamePage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [gameDetails, setGameDetails] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [lineups, setLineups] = useState<any>(null);
    const [incidents, setIncidents] = useState<any>(null);
    const [h2h, setH2h] = useState<any>(null);
    const [standings, setStandings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGameData() {
            try {
                setLoading(true);

                // Fetch game details from internal API (Server-side proxy to API-Sports)
                const response = await fetch(`/api/football/match/${eventId}`);

                if (!response.ok) {
                    throw new Error('Error al cargar datos del partido');
                }

                const data = await response.json();

                if (data.event) {
                    setGameDetails(data.event);
                }

                if (data.statistics) {
                    setStats(data.statistics);
                }

                if (data.lineups) {
                    setLineups(data.lineups);
                }

                if (data.incidents) {
                    setIncidents(data.incidents);
                }

                // Placeholder for H2H/Standings to prevent UI errors
                setH2h([]);
                setStandings([]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameData();

        // Auto-refresh cada 30 segundos
        const interval = setInterval(fetchGameData, 30000);

        return () => clearInterval(interval);
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
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
                        href="/football-live"
                        className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Volver a la lista
                    </Link>
                </div>
            </div>
        );
    }

    // Extraer datos de posesión de forma segura
    const allPeriodStats = stats.statistics.find((p: any) => p.period === 'ALL');
    const possessionGroup = allPeriodStats?.groups.find((g: any) => g.groupName === 'Possession');
    const possessionItem = possessionGroup?.statisticsItems.find((i: any) => i.name === 'Ball possession');

    const homePossession = possessionItem ? parseFloat(possessionItem.home.replace('%', '')) : 50;
    const awayPossession = possessionItem ? parseFloat(possessionItem.away.replace('%', '')) : 50;

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-950 py-4 overflow-x-hidden">
                <div className="container mx-auto px-2 max-w-[1600px]">
                    <Link
                        href="/football-live"
                        className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 mb-4 text-sm"
                    >
                        ← Volver a partidos en vivo
                    </Link>

                    {/* DASHBOARD GRID LAYOUT (3 Columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 w-full">

                        {/* COLUMNA IZQUIERDA: Jugadores Local (3 cols) */}
                        <div className="md:col-span-3 order-2 md:order-1 min-w-0">
                            {lineups && lineups.home ? (
                                <FootballPlayerStatsTable
                                    teamName={gameDetails.homeTeam.name}
                                    players={lineups.home.players}
                                />
                            ) : (
                                <div className="bg-gray-900 p-4 rounded text-center text-gray-500 text-sm">
                                    Alineaciones no disponibles
                                </div>
                            )}
                        </div>

                        {/* COLUMNA CENTRAL: Stats Principales + IA (6 cols) */}
                        <div className="md:col-span-6 order-1 md:order-2 space-y-4 min-w-0">

                            {/* Predicción de IA (Prioridad Alta) */}
                            <AIPredictionCard eventId={eventId} sport="football" />

                            {/* Estadísticas Generales (Barras) */}
                            <FootballStats
                                eventId={eventId}
                                homeTeam={gameDetails.homeTeam.name}
                                awayTeam={gameDetails.awayTeam.name}
                                stats={stats}
                            />

                            {/* Gráficos Visuales */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Gráfico de Posesión */}
                                {possessionItem && (
                                    <PossessionChart
                                        homeTeam={gameDetails.homeTeam.name}
                                        awayTeam={gameDetails.awayTeam.name}
                                        homePossession={homePossession}
                                        awayPossession={awayPossession}
                                    />
                                )}

                                {/* Línea de Tiempo de Incidentes */}
                                {incidents && incidents.length > 0 && (
                                    <IncidentsTimeline
                                        incidents={incidents}
                                        homeTeam={gameDetails.homeTeam.name}
                                        awayTeam={gameDetails.awayTeam.name}
                                    />
                                )}

                                {/* Head to Head */}
                                {h2h && h2h.length > 0 && (
                                    <HeadToHead
                                        events={h2h}
                                        currentHomeTeam={gameDetails.homeTeam.name}
                                        currentAwayTeam={gameDetails.awayTeam.name}
                                    />
                                )}

                                {/* Standings */}
                                {standings && standings.length > 0 && (
                                    <StandingsTable
                                        standings={standings}
                                        currentHomeTeamId={gameDetails.homeTeam.id}
                                        currentAwayTeamId={gameDetails.awayTeam.id}
                                    />
                                )}

                                {/* Best Players / Legends */}
                                <div className="mt-4">
                                    <MatchPlayerStats eventId={parseInt(eventId as string)} sport="football" />
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Jugadores Visitante (3 cols) */}
                        <div className="md:col-span-3 order-3 md:order-3 min-w-0">
                            {lineups && lineups.away ? (
                                <FootballPlayerStatsTable
                                    teamName={gameDetails.awayTeam.name}
                                    players={lineups.away.players}
                                />
                            ) : (
                                <div className="bg-gray-900 p-4 rounded text-center text-gray-500 text-sm">
                                    Alineaciones no disponibles
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="mt-6 text-center pb-8">
                        <p className="text-xs text-gray-600">
                            {gameDetails.status.description} • Actualización cada 30 segundos
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
