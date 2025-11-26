'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import MatchStatsSummary from '@/components/sports/MatchStatsSummary';
import PredictionModal from '@/components/sports/PredictionModal';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { getFootballMatches, type FootballMatch } from '@/lib/footballDataService';
import { useAuth } from '@/contexts/AuthContext';

export default function FootballPage() {
  const [matchesByLeague, setMatchesByLeague] = useState<Record<string, FootballMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const { user, addFavorite, removeFavorite } = useAuth();

  // Selected Match for Stats Bubble
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);

  // Collapsible Leagues State
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({});

  // Prediction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: Date;
  } | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const data = await getFootballMatches();
        setMatchesByLeague(data);
        // Leagues are collapsed by default, so we don't need to set expandedLeagues here
        // as the default state is empty (all false)

      } catch (error) {
        console.error('Error fetching football matches:', error);
        setMatchesByLeague({});
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const toggleLeague = (league: string) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [league]: !prev[league]
    }));
  };

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

  const handlePredictionClick = (e: React.MouseEvent, match: FootballMatch) => {
    e.stopPropagation(); // Prevent triggering match selection
    setSelectedGameForModal({
      id: match.id.toString(),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      date: new Date(match.utcDate)
    });
    setIsModalOpen(true);
  };

  const handleMatchClick = (match: FootballMatch) => {
    setSelectedMatch(match);
  };

  const mapStatus = (status: string): "Programado" | "En Vivo" | "Finalizado" => {
    switch (status) {
      case 'IN_PLAY':
      case 'PAUSED':
        return 'En Vivo';
      case 'FINISHED':
      case 'AWARDED':
        return 'Finalizado';
      case 'TIMED':
      case 'SCHEDULED':
      default:
        return 'Programado';
    }
  };

  const totalMatches = Object.values(matchesByLeague).reduce((acc, league) => acc + league.length, 0);

  return (
    <main className="min-h-screen pb-20 bg-[#0b0b0b]">
      <div className="container pt-8">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatWidget label="Partidos Hoy" value={totalMatches.toString()} icon="⚽" />
          <StatWidget label="Ligas Activas" value={Object.keys(matchesByLeague).length.toString()} icon="🏆" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col gap-4">
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </div>
            ) : Object.keys(matchesByLeague).length > 0 ? (
              Object.entries(matchesByLeague).map(([league, leagueMatches]) => {
                const isExpanded = expandedLeagues[league];

                return (
                  <div key={league} className="mb-4">
                    {/* League Header - Clickable & Collapsible */}
                    <div
                      onClick={() => toggleLeague(league)}
                      className="flex items-center justify-between gap-3 mb-2 pl-3 pr-4 py-3 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] border-l-4 border-[var(--primary)] rounded-r-lg cursor-pointer transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white">
                          {league}
                        </h2>
                        <span className="text-xs font-bold bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--primary)] border-opacity-30">
                          {leagueMatches.length}
                        </span>
                      </div>

                      {/* Chevron Icon */}
                      <span className={`text-[var(--text-muted)] transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>

                    {/* Matches List - Conditionally Rendered */}
                    {isExpanded && (
                      <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">

                        {/* Eventos Section */}
                        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-4 mb-2">
                          <h3 className="text-[var(--primary)] font-bold text-sm mb-2 uppercase tracking-wide">Eventos Destacados</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-[var(--text-muted)] mb-1">Partidos Llamativos</p>
                              <p className="text-sm text-white">🔥 Gran choque en la cumbre de la tabla. Se esperan goles.</p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-muted)] mb-1">Consejo del Mago</p>
                              <p className="text-sm text-white">💡 Atentos a los córners en la segunda mitad.</p>
                            </div>
                          </div>
                        </div>

                        {leagueMatches.map((match) => {
                          const isHomeFavorite = user?.favoriteTeams.includes(match.homeTeam.name);
                          const isAwayFavorite = user?.favoriteTeams.includes(match.awayTeam.name);
                          const isFavorite = isHomeFavorite || isAwayFavorite;
                          const isSelected = selectedMatch?.id === match.id;

                          return (
                            <div
                              key={match.id}
                              onClick={() => handleMatchClick(match)}
                              className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-[var(--primary)] rounded-xl transform scale-[1.01]' : 'hover:bg-[rgba(255,255,255,0.02)] rounded-xl'}`}
                            >
                              <MatchCard
                                homeTeam={match.homeTeam.name}
                                awayTeam={match.awayTeam.name}
                                date={match.utcDate}
                                league={league}
                                homeScore={match.score.fullTime.home}
                                awayScore={match.score.fullTime.away}
                                status={mapStatus(match.status)}
                                isFavorite={isFavorite}
                                onFavoriteToggle={() => {
                                  const teamToToggle = isHomeFavorite ? match.homeTeam.name : match.awayTeam.name;
                                  handleFavoriteToggle(teamToToggle, user?.favoriteTeams.includes(teamToToggle) || false);
                                }}
                                onPredict={(e) => handlePredictionClick(e as any, match)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                No hay partidos programados para hoy
              </div>
            )}
          </div>

          {/* SIDEBAR COLUMN (Widgets) - Spans 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Dynamic Match Stats Bubble */}
            <MatchStatsSummary match={selectedMatch} />

            {/* Wizard's Corner */}
            <div className="glass-card p-1 border border-[var(--secondary)]">
              <div className="bg-[var(--secondary)] text-white text-center py-2 font-bold uppercase text-sm tracking-wider mb-1 rounded-t">
                🧙‍♂️ El Mago Recomienda
              </div>
              <PredictionCard
                title="Real Madrid vs Barcelona"
                description="El Clásico promete goles."
                sport="Fútbol"
                confidence={90}
                odds="-150"
                wizardTip="Ambos Marcan + Over 2.5"
              />
            </div>

            {/* Trending */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-4 text-[var(--accent)]">📈 Tendencias</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Más de 2.5 Goles</span>
                  <span className="text-[var(--success)]">↑ 65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ambos Marcan</span>
                  <span className="text-[var(--success)]">↑ 58%</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Gana</span>
                  <span className="text-[var(--warning)]">→ 45%</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Prediction Modal */}
      {selectedGameForModal && (
        <PredictionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          gameInfo={selectedGameForModal}
        />
      )}
    </main>
  );
}
