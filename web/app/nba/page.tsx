'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import PlayerStatsTable from '@/components/sports/PlayerStatsTable';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { sofascoreService, type SofascoreEvent } from '@/lib/services/sofascoreService';
import { useAuth } from '@/contexts/AuthContext';
import PredictionModal from '@/components/sports/PredictionModal';

type League = 'NBA' | 'Euroleague' | 'All';
type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished';
type BasketballGame = SofascoreEvent;

export default function BasketballPage() {
    const router = useRouter();
    const [selectedLeague, setSelectedLeague] = useState<League>('NBA');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [games, setGames] = useState<BasketballGame[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, addFavorite, removeFavorite } = useAuth();

    // Prediction Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<{
        id: string;
        homeTeam: string;
        awayTeam: string;
        date: Date;
    } | null>(null);

    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                const allGames = await sofascoreService.getAllBasketballGames();

                // Filter by selected league
                let filteredGames = allGames;
                if (selectedLeague !== 'All') {
                    filteredGames = sofascoreService.filterBasketballByLeague(allGames, selectedLeague);
                }

                setGames(filteredGames);
            } catch (error) {
                console.error('Error fetching basketball games:', error);
                setGames([]);
            } finally {
                setLoading(false);
            }
        }

        fetchGames();
    }, [selectedLeague]);

    const handleFavoriteToggle = async (teamName: string, isFavorite: boolean) => {
        if (!user) {
            alert('Debes iniciar sesión para agregar favoritos');
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(teamName);
            } else {
                await addFavorite(teamName);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Error al actualizar favoritos');
        }
    };

    const handleMatchClick = (eventId: number) => {
        router.push(`/basketball-live/${eventId}`);
    };

    const handlePredictionClick = (game: BasketballGame) => {
        setSelectedGame({
            id: game.id.toString(),
            homeTeam: game.homeTeam.name,
            awayTeam: game.awayTeam.name,
            date: new Date(game.startTimestamp * 1000)
        });
        setIsModalOpen(true);
    };

    // Map status to Spanish
    const mapStatus = (statusType: string): "Programado" | "En Vivo" | "Finalizado" => {
        switch (statusType) {
            case 'inprogress':
                return 'En Vivo';
            case 'finished':
                return 'Finalizado';
            case 'notstarted':
            default:
                return 'Programado';
        }
    };

    // Filter games by status
    const filteredGames = games.filter(game => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'live') return game.status.type === 'inprogress';
        if (statusFilter === 'upcoming') return game.status.type === 'notstarted';
        if (statusFilter === 'finished') return game.status.type === 'finished';
        return true;
    });

    return (
        <main className="min-h-screen pb-20 bg-[#0b0b0b]">
            <div className="container pt-8">

                {/* League Selector Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setSelectedLeague('NBA')}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${selectedLeague === 'NBA'
                            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black'
                            : 'glass-card text-[var(--text-muted)] hover:text-white'
                            }`}
                    >
                        🏀 NBA
                    </button>
                    <button
                        onClick={() => setSelectedLeague('Euroleague')}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${selectedLeague === 'Euroleague'
                            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black'
                            : 'glass-card text-[var(--text-muted)] hover:text-white'
                            }`}
                    >
                        🇪🇺 Euroliga
                    </button>
                    <button
                        onClick={() => setSelectedLeague('All')}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${selectedLeague === 'All'
                            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black'
                            : 'glass-card text-[var(--text-muted)] hover:text-white'
                            }`}
                    >
                        🌐 Todas
                    </button>
                </div>

                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatWidget label="Partidos Hoy" value={games.length.toString()} icon="🏀" />
                    <StatWidget label="Acierto IA" value="78%" trend="up" color="var(--success)" />
                    <StatWidget label="ROI Mensual" value="+15.4%" trend="up" color="var(--accent)" />
                    <StatWidget label="Racha Mago" value="5 W" icon="🔥" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* MAIN COLUMN (Match List) - Spans 8 cols */}
                    <div className="lg:col-span-8">
                        <div className="glass-card p-4 mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-2xl">
                                    {selectedLeague === 'NBA' ? '🏀' : selectedLeague === 'Euroleague' ? '🇪🇺' : '🌐'}
                                </span>
                                {selectedLeague}
                            </h2>
                            <span className="text-xs font-bold bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded text-[var(--text-muted)]">
                                HOY
                            </span>
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            >
                                🌐 Todos ({games.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('live')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'live'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            >
                                🔴 En Vivo ({games.filter(g => g.status.type === 'inprogress').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('upcoming')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'upcoming'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            >
                                ⏰ Próximos ({games.filter(g => g.status.type === 'notstarted').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('finished')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'finished'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            >
                                ✅ Finalizados ({games.filter(g => g.status.type === 'finished').length})
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <>
                                    <SkeletonLoader />
                                    <SkeletonLoader />
                                    <SkeletonLoader />
                                </>
                            ) : filteredGames.length > 0 ? (
                                filteredGames.map((game) => (
                                    <div key={game.id} onClick={() => handleMatchClick(game.id)} className="cursor-pointer">
                                        <MatchCard
                                            homeTeam={game.homeTeam.name}
                                            awayTeam={game.awayTeam.name}
                                            homeScore={game.homeScore.current}
                                            awayScore={game.awayScore.current}
                                            date={new Date(game.startTimestamp * 1000).toISOString()}
                                            status={mapStatus(game.status.type)}
                                            league={game.tournament.uniqueTournament?.name || game.tournament.name}
                                            isFavorite={false}
                                            onFavoriteToggle={() => handleFavoriteToggle(game.homeTeam.name, false)}
                                            onPredict={() => handlePredictionClick(game)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                                    No hay partidos {statusFilter !== 'all' ? `${statusFilter === 'live' ? 'en vivo' : statusFilter === 'upcoming' ? 'próximos' : 'finalizados'}` : ''} para hoy
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SIDEBAR COLUMN (Widgets) - Spans 4 cols */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Wizard's Corner */}
                        <div className="glass-card p-1 border border-[var(--secondary)]">
                            <div className="bg-[var(--secondary)] text-white text-center py-2 font-bold uppercase text-sm tracking-wider mb-1 rounded-t">
                                🧙‍♂️ Zona del Mago
                            </div>
                            {(() => {
                                const wizardPick = games.length > 0
                                    ? games[Math.floor(Math.random() * Math.min(games.length, 5))]
                                    : null;

                                if (!wizardPick) {
                                    return (
                                        <div className="p-4 text-center text-[var(--text-muted)]">
                                            No hay picks disponibles hoy
                                        </div>
                                    );
                                }

                                const confidence = Math.floor(Math.random() * 15) + 80;
                                const odds = (Math.random() * 0.5 + 1.7).toFixed(2);

                                return (
                                    <PredictionCard
                                        title={`${wizardPick.homeTeam.name} vs ${wizardPick.awayTeam.name}`}
                                        description="Pick del día basado en análisis IA"
                                        sport="NBA"
                                        confidence={confidence}
                                        odds={odds}
                                        wizardTip={`${wizardPick.homeTeam.name} ML`}
                                    />
                                );
                            })()}
                        </div>

                        {/* Top Players Stats */}
                        <PlayerStatsTable />

                        {/* AI Insights */}
                        <div className="glass-card p-1 border border-[var(--primary)]">
                            <div className="bg-[var(--primary)] text-black text-center py-2 font-bold uppercase text-sm tracking-wider mb-1 rounded-t">
                                🤖 IA Picks
                            </div>
                            <PredictionCard
                                title="Celtics vs Heat"
                                description="Defensa sólida de Boston."
                                sport="NBA"
                                confidence={72}
                                odds="+125"
                                wizardTip="Under 215.5"
                            />
                        </div>

                        {/* Ad / Promo Placeholder */}
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[200px] opacity-50 border-dashed border-2 border-[rgba(255,255,255,0.1)]">
                            <span className="text-4xl mb-2">👑</span>
                            <h3 className="font-bold">Premium Access</h3>
                            <p className="text-sm text-[var(--text-muted)]">Desbloquea todas las predicciones</p>
                        </div>

                    </div>

                </div>
            </div>

            {/* Prediction Modal */}
            {selectedGame && (
                <PredictionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    gameInfo={{
                        id: selectedGame.id,
                        homeTeam: selectedGame.homeTeam,
                        awayTeam: selectedGame.awayTeam,
                        date: selectedGame.date
                    }}
                />
            )}
        </main>
    );
}
