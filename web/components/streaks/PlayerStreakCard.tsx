'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame } from 'lucide-react';
import type { PlayerStreak } from '@/lib/services/streakService';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface PlayerStreakCardProps {
    streak: PlayerStreak;
    index: number;
}

const SimpleSparkline = ({ data, color }: { data: number[], color: string }) => {
    // Ensure we have data
    if (!data || data.length === 0) return null;

    const chartData = data.map((val, i) => ({ val, i }));
    return (
        <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function PlayerStreakCard({ streak, index }: PlayerStreakCardProps) {
    const isPositive = streak.trend === 'over';
    const trendColor = isPositive ? '#10b981' : '#ef4444'; // emerald-500 : red-500

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#121212] rounded-2xl border border-white/5 overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-5 flex flex-col h-full">
                {/* Header: Player Info & Team */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-14 h-14 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-yellow-500 rounded-2xl blur animate-pulse opacity-20"></div>
                        <img
                            src={streak.playerId ? `/api/proxy/player-image/${streak.playerId}` : streak.playerImage}
                            alt={streak.playerName}
                            className="w-full h-full object-cover rounded-2xl border border-white/10 relative z-10 bg-black/40"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                            }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-black bg-white z-20 flex items-center justify-center overflow-hidden">
                            <img
                                src={streak.teamLogo}
                                alt="Team"
                                className="w-full h-full object-contain p-0.5"
                            />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-black italic uppercase text-white leading-tight truncate pr-2">
                            {streak.playerName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                {streak.sport === 'basketball' ? 'NBA' : streak.sport}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Stat Display */}
                <div className="mb-5">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-black text-white tracking-tighter">
                            {streak.count}
                        </span>
                        <span className="text-xs font-black text-white/40 mb-1.5 uppercase tracking-widest">
                            Partidos Cons.
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp size={16} />
                        <span className="text-xs font-black uppercase">
                            {streak.trend === 'over' ? 'Superando' : 'Bajo'} {streak.value} {streak.type}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                {(streak.seasonAverage > 0 || (streak.last5Values && streak.last5Values.length > 0)) && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">
                                Promedio 23/24
                            </div>
                            <div className="text-lg font-black text-white">
                                {streak.seasonAverage}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 relative overflow-hidden">
                            <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1 relative z-10">
                                Últimos 5
                            </div>
                            {streak.last5Values && (
                                <div className="mt-1">
                                    <SimpleSparkline data={streak.last5Values} color={trendColor} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="bg-black/40 rounded-xl p-3 border border-dashed border-white/10 mb-auto">
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        "{streak.description}"
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        {streak.lastMatch}
                    </span>

                    <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-black text-orange-400 tabular-nums">{streak.confidenceScore}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
