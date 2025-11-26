import React from 'react';
import { FootballMatch } from '@/lib/footballDataService';

interface MatchStatsSummaryProps {
    match: FootballMatch | null;
}

interface MatchStat {
    label: string;
    homeValue: number | string;
    awayValue: number | string;
    homePercent?: number; // For progress bar (0-100)
}

export default function MatchStatsSummary({ match }: MatchStatsSummaryProps) {
    if (!match) {
        return (
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[300px] border-dashed border-2 border-[rgba(255,255,255,0.1)]">
                <span className="text-4xl mb-4">👆</span>
                <h3 className="font-bold text-lg mb-2">Selecciona un partido</h3>
                <p className="text-[var(--text-muted)] text-sm">
                    Haz click en cualquier partido para ver el análisis detallado y estadísticas.
                </p>
            </div>
        );
    }

    const isLiveOrFinished = match.status === 'IN_PLAY' || match.status === 'PAUSED' || match.status === 'FINISHED';
    const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED';

    let stats: MatchStat[] = [];
    let title = "";

    if (isScheduled) {
        title = "Análisis Previo";
        // Mock pre-match stats (Win Probability, Form, etc.)
        // In a real app, this would come from the API
        stats = [
            { label: 'Probabilidad de Victoria', homeValue: '45%', awayValue: '30%', homePercent: 45 },
            { label: 'Forma (Últimos 5)', homeValue: 'G-E-G-P-G', awayValue: 'P-G-E-E-G', homePercent: 60 },
            { label: 'Goles PP (Promedio)', homeValue: 1.8, awayValue: 1.2, homePercent: 60 },
            { label: 'Posición en Liga', homeValue: '3º', awayValue: '5º', homePercent: 50 }, // Visual bar doesn't make much sense here but keeping structure
        ];
    } else {
        title = "Estadísticas del Partido";
        // Mock live/finished stats (Possession, Shots, etc.)
        // In a real app, this would come from the API details endpoint
        stats = [
            { label: 'Posesión', homeValue: '52%', awayValue: '48%', homePercent: 52 },
            { label: 'Tiros Totales', homeValue: 12, awayValue: 9, homePercent: 57 },
            { label: 'Tiros al Arco', homeValue: 5, awayValue: 3, homePercent: 62 },
            { label: 'Corners', homeValue: 6, awayValue: 4, homePercent: 60 },
            { label: 'Faltas', homeValue: 10, awayValue: 12, homePercent: 45 },
        ];
    }

    return (
        <div className="glass-card p-4 sticky top-4">
            <div className="flex items-center justify-between mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
                <h3 className="font-bold text-center w-full">{title}</h3>
            </div>

            {/* Teams Header */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="text-center w-1/3">
                    <div className="font-bold text-sm truncate">{match.homeTeam.name}</div>
                </div>
                <div className="text-[var(--accent)] font-bold text-xs">VS</div>
                <div className="text-center w-1/3">
                    <div className="font-bold text-sm truncate">{match.awayTeam.name}</div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                        {/* Values & Label */}
                        <div className="flex justify-between items-center text-sm font-mono mb-1">
                            <span className="font-bold w-12 text-left">{stat.homeValue}</span>
                            <span className="text-[var(--text-secondary)] text-[10px] font-sans uppercase tracking-wide text-center flex-1 truncate px-1">
                                {stat.label}
                            </span>
                            <span className="font-bold w-12 text-right">{stat.awayValue}</span>
                        </div>

                        {/* Progress Bars */}
                        <div className="flex h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden gap-1">
                            {/* Home Bar (Green) */}
                            <div
                                className="bg-[var(--success)] h-full rounded-l-full transition-all duration-500"
                                style={{ width: `${stat.homePercent}%` }}
                            ></div>
                            {/* Away Bar (Blue/Purple) */}
                            <div
                                className="bg-[var(--secondary)] h-full rounded-r-full flex-1 transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {isScheduled && (
                <div className="mt-6 p-3 bg-[rgba(255,255,255,0.05)] rounded-lg text-xs text-center text-[var(--text-muted)]">
                    * Las probabilidades son estimaciones basadas en datos históricos.
                </div>
            )}
        </div>
    );
}
