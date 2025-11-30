'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface PeriodScoreChartProps {
    homeTeam: string;
    awayTeam: string;
    periods: {
        name: string;
        home: number;
        away: number;
    }[];
}

export default function PeriodScoreChart({ homeTeam, awayTeam, periods }: PeriodScoreChartProps) {
    return (
        <div className="w-full h-[300px] bg-gray-900 rounded-lg p-4">
            <h3 className="text-center text-white font-bold mb-4">Puntuación por Periodo</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={periods}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Legend />
                    <Bar dataKey="home" name={homeTeam} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="away" name={awayTeam} fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
