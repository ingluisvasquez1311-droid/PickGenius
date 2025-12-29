'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';

interface StatRadarChartProps {
    homeTeam: string;
    awayTeam: string;
    stats: {
        label: string;
        home: number;
        away: number;
        fullMark: number;
    }[];
}

export default function StatRadarChart({ homeTeam, awayTeam, stats }: StatRadarChartProps) {
    return (
        <div className="w-full h-[400px] bg-gray-900 rounded-lg p-4">
            <h3 className="text-center text-white font-bold mb-4">Comparación de Rendimiento</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />

                    <Radar
                        name={homeTeam}
                        dataKey="home"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="#3B82F6"
                        fillOpacity={0.3}
                    />
                    <Radar
                        name={awayTeam}
                        dataKey="away"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fill="#EF4444"
                        fillOpacity={0.3}
                    />

                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
