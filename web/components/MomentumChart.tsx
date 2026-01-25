"use client";

import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { Activity, Zap } from 'lucide-react';

interface MomentumChartProps {
    homeTeam: string;
    awayTeam: string;
    currentScore: { home: number; away: number };
    status: string; // 'inprogress', 'finished', 'scheduled'
}

export default function MomentumChart({ homeTeam, awayTeam, currentScore, status }: MomentumChartProps) {
    const [data, setData] = useState<any[]>([]);

    // Generate simulated momentum data if we don't have a real websocket yet
    // In a real app, this would come from a `live-stats` endpoint per minute
    useMemo(() => {
        const points = [];
        const minutes = status === 'finished' ? 90 : 45; // Default buckets
        let momentum = 0;

        for (let i = 0; i <= minutes; i += 2) {
            // Random flux
            const change = (Math.random() - 0.5) * 10;
            momentum += change;

            // Correction based on score?
            // If home is winning, bias towards positive
            if (currentScore.home > currentScore.away) momentum += 2;
            else if (currentScore.away > currentScore.home) momentum -= 2;

            // Clamp
            momentum = Math.max(-100, Math.min(100, momentum));

            points.push({
                minute: i,
                value: momentum,
                timeLabel: `${i}'`
            });
        }
        setData(points);
    }, [currentScore, status]);

    if (status === 'scheduled') return null;

    return (
        <div className="w-full glass-card p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="text-sm font-black italic uppercase text-white tracking-widest">Momentum de Partido</h3>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></span>
                        {homeTeam.substring(0, 10)}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></span>
                        {awayTeam.substring(0, 10)}
                    </div>
                </div>
            </div>

            <div className="h-48 w-full relative">
                {/* Center Line Decoration */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 z-0"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="50%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#ef4444" stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF5F1F" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#FF5F1F" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAway" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const val = Number(payload[0].value);
                                    return (
                                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest">
                                            {payload[0].payload.timeLabel}: {val > 0 ? "Presión Local" : "Presión Visitante"}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <ReferenceLine y={0} stroke="#ffffff20" />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="none"
                            fill="url(#splitColor)"
                        />
                        {/* We overlay two areas for correct coloring positive/negative? 
                             Recharts `splitColor` gradient trick is simpler but let's try a gradient offset approach if needed.
                             Actually, for a simple implementation, the gradient split at 50% works if Y domain is centered.
                         */}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">
                <span>Inicio</span>
                <span className="flex items-center gap-1 text-primary"><Zap className="w-3 h-3" /> En Vivo</span>
                <span>Final</span>
            </div>
        </div>
    );
}
