import React from 'react';
import MatchCard from '@/components/sports/MatchCard';
import PredictionCard from '@/components/sports/PredictionCard';
import StatWidget from '@/components/sports/StatWidget';
import PlayerStatsTable from '@/components/sports/PlayerStatsTable';
import { MOCK_MATCHES } from '@/lib/api';

export default function NBAPage() {
    return (
        <main className="min-h-screen pb-20 bg-[#0b0b0b]">
            <div className="container pt-8">

                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatWidget label="Partidos Hoy" value="8" icon="🏀" />
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

                        <div className="flex flex-col">
                            {MOCK_MATCHES.filter(m => m.league === 'NBA').map((match) => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.homeTeam}
                                    awayTeam={match.awayTeam}
                                    date={match.date}
                                    league={match.league}
                                    prediction={match.prediction}
                                />
                            ))}
                            {/* More Mock Data for density */}
                            <MatchCard homeTeam="Bucks" awayTeam="Suns" date={new Date().toISOString()} league="NBA" />
                            <MatchCard homeTeam="Nuggets" awayTeam="Clippers" date={new Date().toISOString()} league="NBA" />
                            <MatchCard homeTeam="Mavericks" awayTeam="Kings" date={new Date().toISOString()} league="NBA" />
                            <MatchCard homeTeam="Knicks" awayTeam="Nets" date={new Date().toISOString()} league="NBA" />
                        </div>
                    </div>

                    {/* SIDEBAR COLUMN (Widgets) - Spans 4 cols */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Wizard's Corner */}
                        <div className="glass-card p-1 border border-[var(--secondary)]">
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
        </main>
    );
}
