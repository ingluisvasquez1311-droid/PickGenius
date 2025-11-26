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

            );
})
    ) : (
    <div className="glass-card p-8 text-center text-[var(--text-muted)]">
        No hay partidos programados para hoy
    </div>
)
}
                        </div >
                    </div >

    {/* SIDEBAR COLUMN (Widgets) - Spans 4 cols */ }
    < div className = "lg:col-span-4 flex flex-col gap-6" >

        {/* Wizard's Corner */ }
        < div className = "glass-card p-1 border border-[var(--secondary)]" >
                            <div className="bg-[var(--secondary)] text-white text-center py-2 font-bold uppercase text-sm tracking-wider mb-1 rounded-t">
                                🧙‍♂️ Zona del Mago
                            </div>
                            <PredictionCard
                                title="Lakers vs Warriors"
                                description="LeBron domina en casa."
                                sport="NBA"
                                confidence={85}
                                odds="-110"
                                wizardTip="Lakers -5.5"
                            />
                        </div >

    {/* Top Players Stats */ }
    < PlayerStatsTable />

    {/* AI Insights */ }
    < div className = "glass-card p-1 border border-[var(--primary)]" >
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
                        </div >

    {/* Ad / Promo Placeholder */ }
    < div className = "glass-card p-6 flex flex-col items-center justify-center text-center min-h-[200px] opacity-50 border-dashed border-2 border-[rgba(255,255,255,0.1)]" >
                            <span className="text-4xl mb-2">👑</span>
                            <h3 className="font-bold">Premium Access</h3>
                            <p className="text-sm text-[var(--text-muted)]">Desbloquea todas las predicciones</p>
                        </div >

                    </div >

                </div >
            </div >

    {/* Prediction Modal */ }
{
    selectedGame && (
        <PredictionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            gameInfo={selectedGame}
        />
    )
}
        </main >
    );
}
