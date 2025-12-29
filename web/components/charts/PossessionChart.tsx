'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface PossessionChartProps {
    homeTeam: string;
    awayTeam: string;
    homePossession: number;
    awayPossession: number;
}

export default function PossessionChart({
    homeTeam,
    awayTeam,
    homePossession,
    awayPossession
}: PossessionChartProps) {
    const data = [
        { name: homeTeam, value: homePossession },
        { name: awayTeam, value: awayPossession },
    ];

    const COLORS = ['#22c55e', '#ef4444']; // Green for Home, Red for Away

    return (
        <div className="w-full h-[300px] bg-gray-900 rounded-lg p-4">
            <h3 className="text-center text-white font-bold mb-4">Posesión del Balón</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => `${value}%`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-[-140px] mb-[100px]">
                <span className="text-2xl font-bold text-white">
                    {homePossession}% - {awayPossession}%
                </span>
            </div>
        </div>
    );
}
