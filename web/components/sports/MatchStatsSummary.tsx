import React from 'react';

interface MatchStat {
    label: string;
    homeValue: number | string;
    awayValue: number | string;
    homePercent?: number; // For progress bar
}

const MOCK_STATS: MatchStat[] = [
    { label: 'Posesión de pelota', homeValue: '48%', awayValue: '52%', homePercent: 48 },
    { label: 'Goles esperados (xG)', homeValue: 1.79, awayValue: 1.58, homePercent: 53 },
    { label: 'Grandes ocasiones', homeValue: 3, awayValue: 1, homePercent: 75 },
    { label: 'Tiros totales', homeValue: 14, awayValue: 14, homePercent: 50 },
    { label: 'Atajadas', homeValue: 2, awayValue: 3, homePercent: 40 },
    { label: 'Corners', homeValue: 3, awayValue: 3, homePercent: 50 },
    { label: 'Faltas', homeValue: 13, awayValue: 16, homePercent: 45 },
];

export default function MatchStatsSummary() {
    return (
        <div className="glass-card p-4">
            <h3 className="text-center font-bold mb-6">Resumen del partido</h3>

            <div className="flex flex-col gap-6">
                {MOCK_STATS.map((stat, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                        {/* Values & Label */}
                        <div className="flex justify-between items-center text-sm font-mono mb-1">
                            <span className="font-bold">{stat.homeValue}</span>
                            <span className="text-[var(--text-secondary)] text-xs font-sans uppercase tracking-wide">{stat.label}</span>
                            <span className="font-bold">{stat.awayValue}</span>
                        </div>

                        {/* Progress Bars */}
                        <div className="flex h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden gap-1">
                            {/* Home Bar (Green) */}
                            <div
                                className="bg-[var(--success)] h-full rounded-l-full"
                                style={{ width: `${stat.homePercent}%` }}
                            ></div>
                            {/* Away Bar (Blue/Purple) */}
                            <div
                                className="bg-[var(--secondary)] h-full rounded-r-full flex-1"
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
