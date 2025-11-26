'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import PlayerStatsTable from '@/components/sports/PlayerStatsTable';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { getTodayGames, type NBAGame } from '@/lib/nbaDataService';
import { useAuth } from '@/contexts/AuthContext';
import PredictionModal from '@/components/sports/PredictionModal';

export default function NBAPage() {
    const [games, setGames] = useState<NBAGame[]>([]);
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
                const gamesData = await getTodayGames();
                setGames(gamesData);
            } catch (error) {
                console.error('Error fetching NBA games:', error);
                setGames([]);
            } finally {
                setLoading(false);
            }
        }

        fetchGames();
    }, []);

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

    const handlePredictionClick = (game: NBAGame) => {
        setSelectedGame({
            id: game.id,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            date: game.date
        });
        setIsModalOpen(true);
    };

    // Map NBA status to Spanish
    const mapStatus = (status: string): "Programado" | "En Vivo" | "Finalizado" => {
        switch (status) {
            case 'Live':
                return 'En Vivo';
            case 'Finished':
                return 'Finalizado';
            case 'Scheduled':
            default:
                return 'Programado';
        }
    };

    return (
        <main className="min-h-screen pb-20 bg-[#0b0b0b]">
            <div className="container pt-8">

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
                                <span className="text-2xl">🏀</span> NBA
                            </h2>
                            <span className="text-xs font-bold bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded text-[var(--text-muted)]">
                                HOY
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <>
                                    <SkeletonLoader />
                                    <SkeletonLoader />
                                    <SkeletonLoader />
                                </>
                            ) : games.length > 0 ? (
                                games.map((game) => {
                                    const isHomeFavorite = user?.favoriteTeams.includes(game.homeTeam);
                                    const isAwayFavorite = user?.favoriteTeams.includes(game.awayTeam);
                                    const isFavorite = isHomeFavorite || isAwayFavorite;

                                    return (
                                        <MatchCard
                                            key={game.id}
                                            homeTeam={game.homeTeam}
                                            awayTeam={game.awayTeam}
                                            date={game.date.toISOString()}
                                            league="NBA"
                                            homeScore={game.homeScore}
                                            awayScore={game.awayScore}
                                            status={mapStatus(game.status)}
                                            isFavorite={isFavorite}
                                            onFavoriteToggle={() => {
                                                const teamToToggle = isHomeFavorite ? game.homeTeam : game.awayTeam;
                                                handleFavoriteToggle(teamToToggle, user?.favoriteTeams.includes(teamToToggle) || false);
                                            }}
                                            onPredict={() => handlePredictionClick(game)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                                    No hay partidos programados para hoy
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
                                // Select a random game from today for wizard pick
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
                                        title={`${wizardPick.homeTeam} vs ${wizardPick.awayTeam}`}
                                        description="Pick del día basado en análisis IA"
                                        sport="NBA"
                                        confidence={confidence}
                                        odds={odds}
                                        wizardTip={`${wizardPick.homeTeam} ML`}
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
                    gameInfo={selectedGame}
                />
            )}
        </main>
    );
}
