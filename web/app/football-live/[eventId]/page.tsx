'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FootballStats from '@/components/football/FootballStats';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import PossessionChart from '@/components/charts/PossessionChart';
import AIPredictionCard from '@/components/ai/AIPredictionCard';
import FootballPlayerStatsTable from '@/components/football/FootballPlayerStatsTable';
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

                // Fetch game details, stats, lineups, incidents and h2h in parallel
                const [detailsRes, statsRes, lineupsRes, incidentsRes, h2hRes] = await Promise.all([
                    fetch(`${API_URL}/api/sofascore/football/match/${eventId}`),
                    fetch(`${API_URL}/api/sofascore/football/match/${eventId}/stats`),
                    fetch(`${API_URL}/api/sofascore/football/match/${eventId}/lineups`),
                    fetch(`${API_URL}/api/sofascore/football/match/${eventId}/incidents`),
                    fetch(`${API_URL}/api/sofascore/football/match/${eventId}/h2h`)
                ]);

                if (!detailsRes.ok || !statsRes.ok) {
                    throw new Error('Error al cargar datos del partido');
                }

                const detailsData = await detailsRes.json();
                const statsData = await statsRes.json();
                const lineupsData = await lineupsRes.json();
                const incidentsData = await incidentsRes.json();
                const h2hData = await h2hRes.json();

                if (detailsData.success) {
                    setGameDetails(detailsData.data.event);
                }

                if (statsData.success) {
                    setStats(statsData.data);
                }

                if (lineupsData.success) {
                    setLineups(lineupsData.data);
                }

                if (incidentsData.success) {
                    setIncidents(incidentsData.data.incidents || []);
                }

                if (h2hData.success) {
                    setH2h(h2hData.data.events || []);
                }

                // Fetch standings if we have tournament info
                if (detailsData.success && detailsData.data.event.tournament) {
                    const tournament = detailsData.data.event.tournament;
                    const season = detailsData.data.event.season;

                    if (tournament.id && season?.id) {
                        const standingsRes = await fetch(
                            `${API_URL}/api/sofascore/football/tournament/${tournament.id}/season/${season.id}/standings`
                        );
                        const standingsData = await standingsRes.json();

                        if (standingsData.success && standingsData.data.standings) {
                            // Get the first standings group (usually the main league table)
                            const mainStandings = standingsData.data.standings[0];
                            if (mainStandings && mainStandings.rows) {
                                setStandings(mainStandings.rows);
                            }
                        }
                    }
                }

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
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                        {/* COLUMNA IZQUIERDA: Jugadores Local (3 cols) */}
                        <div className="xl:col-span-3 order-2 xl:order-1">
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
                        <div className="xl:col-span-6 order-1 xl:order-2 space-y-4">

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

                                {/* Top Performers */}
                                {lineups && (() => {
                                    // Extract all players with statistics
                                    const allPlayers = [
                                        ...(lineups.home?.players || []).map((p: any) => ({
                                            ...p,
                                            team: { name: gameDetails.homeTeam.name, shortName: gameDetails.homeTeam.shortName }
                                        })),
                                        ...(lineups.away?.players || []).map((p: any) => ({
                                            ...p,
                                            team: { name: gameDetails.awayTeam.name, shortName: gameDetails.awayTeam.shortName }
                                        }))
                                    ].filter(p => p.statistics);

                                    // Top scorers
                                    const topScorers = allPlayers
                                        .filter(p => p.statistics?.goals && p.statistics.goals > 0)
                                        .sort((a, b) => (b.statistics?.goals || 0) - (a.statistics?.goals || 0));

                                    // Top assists
                                    const topAssists = allPlayers
                                        .filter(p => p.statistics?.assists && p.statistics.assists > 0)
                                        .sort((a, b) => (b.statistics?.assists || 0) - (a.statistics?.assists || 0));

                                    return (
                                        <TopPerformers
                                            topScorers={topScorers}
                                            topAssists={topAssists}
                                            isLive={gameDetails.status.type === 'inprogress'}
                                        />
                                    );
                                })()}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Jugadores Visitante (3 cols) */}
                        <div className="xl:col-span-3 order-3 xl:order-3">
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
