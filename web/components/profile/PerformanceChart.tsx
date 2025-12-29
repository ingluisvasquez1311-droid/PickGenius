'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';

interface PerformanceData {
    name: string;
    winRate: number;
    hits: number;
}

const defaultData: PerformanceData[] = [
    { name: 'Lun', winRate: 65, hits: 4 },
    { name: 'Mar', winRate: 72, hits: 6 },
    { name: 'Mié', winRate: 68, hits: 5 },
    { name: 'Jue', winRate: 85, hits: 9 },
    { name: 'Vie', winRate: 78, hits: 7 },
    { name: 'Sáb', winRate: 92, hits: 12 },
    { name: 'Dom', winRate: 88, hits: 10 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c0c0c] border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{label}</p>
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-emerald-400">
                        Acierto: <span className="text-white">{payload[0].value}%</span>
                    </p>
                    <p className="text-xs font-bold text-purple-400">
                        Picks: <span className="text-white">{payload[0].payload.hits}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function PerformanceChart() {
    return (
        <div className="w-full h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={defaultData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="winRate"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorWinRate)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
