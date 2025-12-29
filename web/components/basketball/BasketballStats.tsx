'use client';

import React from 'react';

interface StatItemProps {
    label: string;
    homeValue: string;
    awayValue: string;
    homePercent?: number;
    awayPercent?: number;
}

const StatItem: React.FC<StatItemProps> = ({
    label,
    homeValue,
    awayValue,
    homePercent,
    awayPercent
}) => {
    // Si no hay porcentaje, calcularlo basado en comparación simple
    const homeNum = parseFloat(homeValue.split('/')[0] || '0');
    const awayNum = parseFloat(awayValue.split('/')[0] || '0');
    const total = homeNum + awayNum;

    const homeBar = homePercent !== undefined ? homePercent : (total > 0 ? (homeNum / total) * 100 : 50);
    const awayBar = awayPercent !== undefined ? awayPercent : (total > 0 ? (awayNum / total) * 100 : 50);

    return (
        <div className="py-3 border-b border-gray-700 last:border-0">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-blue-400">{homeValue}</span>
                <span className="text-xs text-gray-400 uppercase">{label}</span>
                <span className="text-sm font-semibold text-red-400">{awayValue}</span>
            </div>
            <div className="flex items-center gap-1 h-2">
                <div
                    className="h-full bg-blue-500 rounded-l transition-all duration-300"
                    style={{ width: `${homeBar}%` }}
                />
                <div
                    className="h-full bg-red-500 rounded-r transition-all duration-300"
                    style={{ width: `${awayBar}%` }}
                />
            </div>
        </div>
    );
};

interface BasketballStatsProps {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    stats: {
        periods: Array<{
            period: string;
            scoring: Record<string, any>;
            rebounds: Record<string, any>;
            other: Record<string, any>;
        }>;
    };
}

export default function BasketballStats({
    eventId,
    homeTeam,
    awayTeam,
    stats
}: BasketballStatsProps) {
    const allPeriod = stats.periods.find(p => p.period === 'ALL');

    if (!allPeriod) {
        return (
            <div className="text-center py-8 text-gray-400">
                No hay estadísticas disponibles
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-2xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-400">{homeTeam}</h2>
                    <span className="text-sm text-gray-500">vs</span>
                    <h2 className="text-xl font-bold text-red-400">{awayTeam}</h2>
                </div>
                <div className="text-xs text-gray-500 text-center">
                    Event ID: {eventId}
                </div>
            </div>

            {/* Scoring Section */}
            <div className="mb-6">
                <h3 className="text-lg font-bold mb-4 text-yellow-400 flex items-center gap-2">
                    <span>🎯</span> PUNTOS
                </h3>
                <div className="bg-gray-800 rounded-lg p-4">
                    {Object.entries(allPeriod.scoring).map(([key, stat]: [string, any]) => (
                        <StatItem
                            key={key}
                            label={key}
                            homeValue={stat.home}
                            awayValue={stat.away}
                        />
                    ))}
                </div>
            </div>

            {/* Rebounds Section */}
            {Object.keys(allPeriod.rebounds).length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-orange-400 flex items-center gap-2">
                        <span>🏀</span> REBOTES
                    </h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                        {Object.entries(allPeriod.rebounds).map(([key, stat]: [string, any]) => (
                            <StatItem
                                key={key}
                                label={key}
                                homeValue={stat.home || String(stat.homeValue)}
                                awayValue={stat.away || String(stat.awayValue)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Stats Section */}
            {Object.keys(allPeriod.other).length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-green-400 flex items-center gap-2">
                        <span>📈</span> OTRAS ESTADÍSTICAS
                    </h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                        {Object.entries(allPeriod.other).map(([key, stat]: [string, any]) => {
                            const homeVal = stat.home || String(stat.homeValue || 0);
                            const awayVal = stat.away || String(stat.awayValue || 0);

                            return (
                                <StatItem
                                    key={key}
                                    label={key}
                                    homeValue={homeVal}
                                    awayValue={awayVal}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
