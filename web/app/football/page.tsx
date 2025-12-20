'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';

import PredictionModal from '@/components/sports/PredictionModal';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { sofascoreService, type SofascoreEvent } from '@/lib/services/sofascoreService';
import { useAuth } from '@/contexts/AuthContext';

// Type alias for compatibility
type FootballMatch = SofascoreEvent;

export default function FootballPage() {
  const [matchesByLeague, setMatchesByLeague] = useState<Record<string, FootballMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const { user, addFavorite, removeFavorite } = useAuth();

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');



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
        const matches = await sofascoreService.getAllFootballMatches();

        // Group matches by league/tournament name
        const grouped = matches.reduce((acc, match) => {
          const leagueName = match.tournament.uniqueTournament?.name || match.tournament.name;
          if (!acc[leagueName]) {
            acc[leagueName] = [];
          }
          acc[leagueName].push(match);
          return acc;
        }, {} as Record<string, FootballMatch[]>);

        setMatchesByLeague(grouped);
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
      date: new Date(match.startTimestamp * 1000) // Convert Unix timestamp to Date
    });
    setIsModalOpen(true);
  };

  const handleMatchClick = (match: FootballMatch) => {
    // Navigate to match detail page with Sofascore ID
    window.location.href = `/football-live/${match.id}`;
  };

  const mapStatus = (status: FootballMatch['status']): "Programado" | "En Vivo" | "Finalizado" => {
    switch (status.type) {
      case 'inprogress':
        return 'En Vivo';
      case 'finished':
        return 'Finalizado';
      case 'notstarted':
      default:
        return 'Programado';
    }
  };

  // Filter matches by status
  const filterMatchesByStatus = (matches: FootballMatch[]) => {
    if (selectedFilter === 'all') return matches;

    return matches.filter(match => {
      const status = mapStatus(match.status);
      if (selectedFilter === 'live') return status === 'En Vivo';
      if (selectedFilter === 'upcoming') return status === 'Programado';
      if (selectedFilter === 'finished') return status === 'Finalizado';
      return true;
    });
  };

  // Calculate counts for each filter
  const allMatches = Object.values(matchesByLeague).flat();
  const liveCount = allMatches.filter(m => mapStatus(m.status) === 'En Vivo').length;
  const upcomingCount = allMatches.filter(m => mapStatus(m.status) === 'Programado').length;
  const finishedCount = allMatches.filter(m => mapStatus(m.status) === 'Finalizado').length;
  const totalMatches = allMatches.length;

  return (
    <main className="min-h-screen pb-20 bg-[#0b0b0b]">
      <div className="container pt-8">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatWidget label="Partidos Hoy" value={totalMatches.toString()} icon="⚽" />
          <StatWidget label="Ligas Activas" value={Object.keys(matchesByLeague).length.toString()} icon="🏆" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${selectedFilter === 'all'
              ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
              : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
          >
            Todos <span className="ml-2 opacity-70">({totalMatches})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('live')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${selectedFilter === 'live'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
          >
            {selectedFilter === 'live' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
            En Vivo <span className="ml-2 opacity-70">({liveCount})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${selectedFilter === 'upcoming'
              ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
              : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
          >
            Próximos <span className="ml-2 opacity-70">({upcomingCount})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('finished')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${selectedFilter === 'finished'
              ? 'bg-gray-600 text-white shadow-lg shadow-gray-600/30'
              : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
          >
            Finalizados <span className="ml-2 opacity-70">({finishedCount})</span>
          </button>
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
                const filteredMatches = filterMatchesByStatus(leagueMatches);
                const isExpanded = expandedLeagues[league];

                // Skip leagues with no matches after filtering
                if (filteredMatches.length === 0) return null;

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
                          {filteredMatches.length}
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

                        {filteredMatches.map((match) => {
                          const isHomeFavorite = user?.favoriteTeams.includes(match.homeTeam.name);
                          const isAwayFavorite = user?.favoriteTeams.includes(match.awayTeam.name);
                          const isFavorite = isHomeFavorite || isAwayFavorite;

                          return (
                            <div
                              key={match.id}
                              onClick={() => handleMatchClick(match)}
                              className="cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.02)] rounded-xl"
                            >
                              <MatchCard
                                eventId={match.id}
                                sport="football"
                                homeTeam={{ name: match.homeTeam.name, id: match.homeTeam.id }}
                                awayTeam={{ name: match.awayTeam.name, id: match.awayTeam.id }}
                                date={new Date(match.startTimestamp * 1000).toISOString()}
                                league={league}
                                homeScore={match.homeScore.current}
                                awayScore={match.awayScore.current}
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



            {/* Wizard's Corner */}
            <div className="glass-card p-1 border border-[var(--secondary)]">
              <div className="bg-[var(--secondary)] text-white text-center py-2 font-bold uppercase text-sm tracking-wider mb-1 rounded-t">
                🧙‍♂️ Zona del Mago
              </div>
              {(() => {
                // Select a random match from today's games for wizard pick
                const allMatches = Object.values(matchesByLeague).flat();
                const wizardPick = allMatches.length > 0
                  ? allMatches[Math.floor(Math.random() * Math.min(allMatches.length, 5))]
                  : null;

                if (!wizardPick) {
                  return (
                    <div className="p-4 text-center text-[var(--text-muted)]">
                      No hay picks disponibles hoy
                    </div>
                  );
                }

                // Generate dynamic confidence and odds
                const confidence = Math.floor(Math.random() * 15) + 80; // 80-95%
                const odds = (Math.random() * 0.6 + 1.6).toFixed(2); // 1.60-2.20

                return (
                  <PredictionCard
                    title={`${wizardPick.homeTeam.name} vs ${wizardPick.awayTeam.name}`}
                    description="Pick del día basado en análisis IA"
                    sport="Fútbol"
                    confidence={confidence}
                    odds={odds}
                    wizardTip={`${wizardPick.homeTeam.name} ML`}
                  />
                );
              })()}
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
