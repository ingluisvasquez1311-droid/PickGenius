'use client';

import React, { useEffect, useState } from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import MatchStatsSummary from '@/components/sports/MatchStatsSummary';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { cacheData, getCachedData } from '@/lib/cache';

interface FootballMatch {
  id: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  utcDate: string;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  status: string;
  competition: { name: string };
}

export default function FootballPage() {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      // Check cache first
      const cached = getCachedData<FootballMatch[]>('cache_football_matches');
      if (cached) {
        setMatches(cached);
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch from multiple leagues
        const leagueIds = [
          'PL',  // Premier League
          'PD',  // La Liga
          'SA',  // Serie A
          'BL1', // Bundesliga
          'FL1'  // Ligue 1
        ];

        const allMatches: FootballMatch[] = [];

        for (const leagueId of leagueIds) {
          try {
            const response = await fetch(
              `https://api.football-data.org/v4/competitions/${leagueId}/matches?dateFrom=${today}&dateTo=${today}`,
              {
                headers: {
                  'X-Auth-Token': 'e8c7b9a4f3d2e1c0b9a8f7e6d5c4b3a2'
                }
              }
            );
            const data = await response.json();
            if (data.matches) {
              allMatches.push(...data.matches);
            }
          } catch (err) {
            console.error(`Error fetching ${leagueId}:`, err);
          }
        }

        setMatches(allMatches);
        cacheData('cache_football_matches', allMatches);
      } catch (error) {
        console.error('Error fetching football matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  // Group matches by league
  const matchesByLeague = matches.reduce((acc, match) => {
    const league = match.competition.name;
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {} as Record<string, FootballMatch[]>);

  return (
    <main className="min-h-screen pb-20 bg-[#0b0b0b]">
      <div className="container pt-8">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatWidget label="Partidos Hoy" value={matches.length.toString()} icon="⚽" />
          <StatWidget label="Acierto IA" value="82%" trend="up" color="var(--success)" />
          <StatWidget label="ROI Mensual" value="+18.2%" trend="up" color="var(--accent)" />
          <StatWidget label="Ligas Activas" value="5" icon="🏆" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN COLUMN (Match List) - Spans 8 cols */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col gap-4">
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </div>
            ) : Object.keys(matchesByLeague).length > 0 ? (
              Object.entries(matchesByLeague).map(([league, leagueMatches]) => (
                <div key={league} className="mb-6">
                  <div className="glass-card p-4 mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="text-2xl">⚽</span> {league}
                    </h2>
                    <span className="text-xs font-bold bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded text-[var(--text-muted)]">
                      HOY
                    </span>
                  </div>

                  <div className="flex flex-col">
                    {leagueMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        homeTeam={match.homeTeam.name}
                        awayTeam={match.awayTeam.name}
                        date={match.utcDate}
                        league={league}
                        homeScore={match.score.fullTime.home}
                        awayScore={match.score.fullTime.away}
                        status={match.status}
                      />
                    ))}
                  </div>
                </div>
              ))
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

            {/* Live Match Stats */}
            <MatchStatsSummary />

            {/* Trending */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-4 text-[var(--accent)]">📈 Tendencias</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Goles Over 2.5</span>
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

            {/* Premium */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[200px] opacity-50 border-dashed border-2 border-[rgba(255,255,255,0.1)]">
              <span className="text-4xl mb-2">👑</span>
              <h3 className="font-bold">Premium Access</h3>
              <p className="text-sm text-[var(--text-muted)]">Análisis profundo de cada partido</p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
