'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Flame } from 'lucide-react';
import type { PlayerStreak } from '@/lib/services/streakService';
import Image from 'next/image';

interface PlayerStreakCardProps {
    streak: PlayerStreak;
    index: number;
}

export default function PlayerStreakCard({ streak, index }: PlayerStreakCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#121212] rounded-2xl border border-white/5 overflow-hidden hover:border-orange-500/30 transition-all duration-300"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-5">
                {/* Header: Player Info & Team */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-yellow-500 rounded-full blur animate-pulse opacity-50"></div>
                        <img
                            src={streak.playerImage}
                            alt={streak.playerName}
                            className="w-full h-full object-cover rounded-full border-2 border-orange-500 relative z-10 bg-black"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                            }}
                        />
                        <img
                            src={streak.teamLogo}
                            alt="Team"
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-black bg-white z-20"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic uppercase text-white leading-tight">
                            {streak.playerName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                                {streak.sport === 'basketball' ? 'NBA' : streak.sport}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Stat Display */}
                <div className="mb-4">
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-4xl font-black text-white tracking-tighter">
                            {streak.count}
                        </span>
                        <span className="text-sm font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                            Partidos Seguidos
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp size={16} />
                        <span className="text-sm font-bold">
                            {streak.trend === 'over' ? 'Superando' : 'Debajo de'} {streak.value} {streak.type.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Description & Confidence */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
                    <p className="text-xs text-gray-300 leading-snug">
                        {streak.description}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-mono">
                        <span>ÚLT: {streak.lastMatch}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-bold text-orange-400">{streak.confidenceScore}/10</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
