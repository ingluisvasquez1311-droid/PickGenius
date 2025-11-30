'use client';

import React from 'react';

interface StatItemProps {
    label: string;
    homeValue: string | number;
    awayValue: string | number;
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
    const homeNum = typeof homeValue === 'string' ? parseFloat(homeValue) : homeValue;
    const awayNum = typeof awayValue === 'string' ? parseFloat(awayValue) : awayValue;
    const total = homeNum + awayNum;

    const homeBar = homePercent !== undefined ? homePercent : (total > 0 ? (homeNum / total) * 100 : 50);
    const awayBar = awayPercent !== undefined ? awayPercent : (total > 0 ? (awayNum / total) * 100 : 50);

    return (
        <div className="py-3 border-b border-gray-700 last:border-0">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-green-400">{homeValue}</span>
                <span className="text-xs text-gray-400 uppercase">{label}</span>
                <span className="text-sm font-semibold text-red-400">{awayValue}</span>
            </div>
            <div className="flex items-center gap-1 h-2">
                <div
                    className="h-full bg-green-500 rounded-l transition-all duration-300"
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

interface FootballStatsProps {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    stats: {
        statistics: Array<{
            period: string;
            groups: Array<{
                groupName: string;
                statisticsItems: Array<{
                    name: string;
                    home: string;
                    away: string;
                    compareCode: number;
                }>;
            }>;
        }>;
    };
}

export default function FootballStats({
    eventId,
    homeTeam,
    awayTeam,
    stats
}: FootballStatsProps) {
    const allPeriod = stats.statistics.find(p => p.period === 'ALL');

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
                    <h2 className="text-xl font-bold text-green-400">{homeTeam}</h2>
                    <span className="text-sm text-gray-500">vs</span>
                    <h2 className="text-xl font-bold text-red-400">{awayTeam}</h2>
                </div>
                <div className="text-xs text-gray-500 text-center">
                    Event ID: {eventId}
                </div>
            </div>

            {/* Stats Groups */}
            {allPeriod.groups.map((group, index) => (
                <div key={index} className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-yellow-400 flex items-center gap-2 uppercase">
                        {group.groupName}
                    </h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                        {group.statisticsItems.map((item, itemIndex) => (
                            <StatItem
                                key={itemIndex}
                                label={item.name}
                                homeValue={item.home}
                                awayValue={item.away}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
