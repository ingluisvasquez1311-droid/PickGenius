'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, Zap, ShieldCheck, User, MapPin } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, YAxis, Cell, ReferenceLine } from 'recharts';

interface UniversalPlayerPropModalProps {
    player: any;
    isOpen: boolean;
    onClose: () => void;
    sport: 'football' | 'basketball' | 'baseball' | 'tennis';
}

export default function UniversalPlayerPropModal({ player, isOpen, onClose, sport }: UniversalPlayerPropModalProps) {
    if (!isOpen || !player) return null;

    const pId = player.id || player.player?.id;
    const pName = player.name || player.player?.name;
    const pRating = player.rating || player.player?.rating || 0;

    const imageUrl = pId ? `/api/proxy/player-image/${pId}` : null;

    // Mock Trend Data for "The Deep Dive"
    const trendData = [
        { game: 1, val: 24, line: 20 },
        { game: 2, val: 18, line: 20 },
        { game: 3, val: 28, line: 20 },
        { game: 4, val: 22, line: 20 },
        { game: 5, val: 21, line: 20 },
    ];

    const getSportStats = () => {
        const stats = player.statistics || player;
        switch (sport) {
            case 'football':
                return [
                    { label: 'Goles', val: stats.goals || 0 },
                    { label: 'Asists', val: stats.assists || 0 },
                    { label: 'Tiros', val: stats.totalShots || 0 }
                ];
            case 'basketball':
                return [
                    { label: 'PTS', val: stats.points || stats.pts || 0 },
                    { label: 'REB', val: stats.rebounds || stats.reb || 0 },
                    { label: 'AST', val: stats.assists || stats.ast || 0 }
                ];
            default:
                return [{ label: 'Rating', val: pRating }];
        }
    };

    const mainStats = getSportStats();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,1)] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >

                    {/* Gradient Header */}
                    <div className="h-48 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-transparent relative">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white transition-all z-20"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Main Content Container */}
                    <div className="px-8 pb-10 -mt-24 relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                            {/* Player Photo */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition-all" />
                                <div className="relative w-32 h-32 rounded-[2rem] border-2 border-white/10 bg-gray-900 overflow-hidden">
                                    {imageUrl ? (
                                        <Image src={imageUrl} alt={pName} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20 uppercase">
                                            {pName?.substring(0, 1)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
                                    <ShieldCheck className="w-3 h-3" /> PickGenius VIP Analysis
                                </div>
                                <h2 className="text-4xl font-black italic text-white leading-none uppercase tracking-tighter mb-2">
                                    {pName}
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                                        {player.position || 'Player'}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                        RATING: {pRating}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                            {/* Left: Stats & Metrics */}
                            <div className="space-y-4 lg:y-6">
                                <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-yellow-400" /> Rendimiento Live
                                </h3>
                                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                                    {mainStats.map((s, i) => (
                                        <div key={i} className="p-3 lg:p-4 rounded-2xl lg:rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-center">
                                            <div className="text-[7px] lg:text-[8px] font-black text-gray-500 uppercase mb-1">{s.label}</div>
                                            <div className="text-lg lg:text-xl font-black italic text-white">{s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Narrative Insights */}
                                <div className="p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                                    <p className="text-[10px] lg:text-[11px] text-indigo-100/70 leading-relaxed font-medium">
                                        🚀 <span className="text-white font-bold">Insight AI:</span> Este jugador está manteniendo un volumen de tiros un <span className="text-blue-400 font-black">14% superior</span> a su promedio histórico. <span className="text-white/40">Recomendamos vigilar las líneas de Props para este encuentro.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Right: Trends Chart */}
                            <div className="space-y-4 lg:y-6">
                                <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3 text-purple-400" /> Tendencia Últimos 5
                                </h3>
                                <div className="h-[140px] lg:h-[180px] w-full bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <YAxis hide domain={[0, 'dataMax + 5']} />
                                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                                {trendData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.val >= entry.line ? '#a855f7' : '#333'}
                                                    />
                                                ))}
                                            </Bar>
                                            <ReferenceLine y={20} stroke="#444" strokeDasharray="3 3" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-between mt-2 px-2">
                                        <span className="text-[8px] font-black text-gray-600 uppercase">Más antiguos</span>
                                        <span className="text-[8px] font-black text-gray-600 uppercase">Último</span>
                                    </div>
                                </div>
                                <p className="text-[9px] text-center text-gray-500 uppercase font-bold tracking-widest">
                                    La línea punteada indica el promedio de mercado
                                </p>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Estadio: Santiago Bernabéu</span>
                            </div>
                            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)]">
                                Analizar Prop Completo
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
