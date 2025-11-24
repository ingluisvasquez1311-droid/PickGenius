import React from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import MatchStatsSummary from '@/components/sports/MatchStatsSummary';

export default function FootballPage() {
  return (
    <main className="min-h-screen pb-20 bg-[#0b0b0b]">
      <div className="container pt-8">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatWidget label="Partidos Live" value="12" icon="⚽" color="var(--danger)" />
          <StatWidget label="Acierto Mago" value="82%" trend="up" color="var(--success)" />
          <StatWidget label="BTTS Trend" value="High" trend="up" color="var(--accent)" />
          <StatWidget label="Ligas Activas" value="5" icon="🌍" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN COLUMN (Match List) */}
          <div className="lg:col-span-8">

            {/* Premier League Section */}
            <div className="mb-6">
              <div className="glass-card p-3 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">PL</div>
                <h2 className="font-bold">Premier League</h2>
              </div>
              <div className="flex flex-col">
                <MatchCard homeTeam="Liverpool" awayTeam="Chelsea" date={new Date().toISOString()} league="Premier League" status="Live" homeScore={1} awayScore={1} />
                <MatchCard homeTeam="Man City" awayTeam="Arsenal" date={new Date().toISOString()} league="Premier League" status="Scheduled" />
                <MatchCard homeTeam="Spurs" awayTeam="United" date={new Date().toISOString()} league="Premier League" status="Scheduled" />
              </div>
            </div>

            {/* La Liga Section */}
            <div className="mb-6">
              <div className="glass-card p-3 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">LL</div>
                <h2 className="font-bold">La Liga</h2>
              </div>
              <div className="flex flex-col">
                <MatchCard homeTeam="Real Madrid" awayTeam="Barcelona" date={new Date().toISOString()} league="La Liga" status="Scheduled" prediction={{ pick: "BTTS", odds: "-150", confidence: 90 }} />
                <MatchCard homeTeam="Atletico" awayTeam="Sevilla" date={new Date().toISOString()} league="La Liga" status="Scheduled" />
              </div>
            </div>

          </div>

          {/* SIDEBAR COLUMN (Widgets) */}
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
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span>Over 2.5 Goles</span>
                  <span className="font-bold text-[var(--success)]">80% Last 5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Home Wins</span>
                  <span className="font-bold">65% Today</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
