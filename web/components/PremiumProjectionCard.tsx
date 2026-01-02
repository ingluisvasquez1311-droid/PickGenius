"use client";

import React from 'react';
import { Sparkles, Target, ShieldAlert, Zap, TrendingUp, Activity, Trophy, Dumbbell } from 'lucide-react';
import clsx from 'clsx';

export type SportType = 'football' | 'basketball' | 'baseball' | 'nfl' | 'tennis' | 'other';

interface Projections {
    item1?: { label: string; value: string };
    item2?: { label: string; value: string };
    item3?: { label: string; value: string };
}

export interface PremiumProjectionCardProps {
    sport: SportType;
    projections: Projections;
    isVisible: boolean;
    confidence?: number;
    mvpName?: string; // New: MVP Player Name
    marketType?: string; // New: Over/Under market context
}

export const PremiumProjectionCard = ({ sport, projections, isVisible, confidence = 85, mvpName, marketType }: PremiumProjectionCardProps) => {
    if (!isVisible) return null;

    // Default items by sport if projections are missing
    const getDefaults = (s: SportType) => {
        switch (s) {
            case 'basketball':
                return [
                    { label: 'Puntos Tot.', value: '220.5', type: 'over' }, // Example default
                    { label: 'Rebotes', value: '42.5', type: 'under' },
                    { label: 'Triples', value: '12.5', type: 'over' },
                ];
            // ... (keep other defaults similar but we rely on props mostly)
            default:
                return [
                    { label: 'Córners', value: '9.5', type: 'over' },
                    { label: 'Tiros Arco', value: '8.5', type: 'over' },
                    { label: 'Tarjetas', value: '3.5', type: 'under' },
                ];
        }
    };

    const displayItems = [
        projections.item1 || { label: 'Stat 1', value: '--' },
        projections.item2 || { label: 'Stat 2', value: '--' },
        projections.item3 || { label: 'Stat 3', value: '--' },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 duration-700">
            <div className="relative group perspective-[1000px]">
                {/* Holographic Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-tilt"></div>

                <div className="relative glass-card bg-[#050505]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-6 min-w-[360px] transform transition-transform duration-500 hover:rotate-y-[2deg]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 relative overflow-hidden">
                        {/* Shimmer Effect on Header */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-xl animate-pulse"></div>
                                <div className="bg-gradient-to-br from-primary/20 to-black p-3 rounded-xl border border-primary/30 relative">
                                    <Sparkles className="w-5 h-5 text-primary animate-[spin_4s_linear_infinite]" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                    Radar {sport.toUpperCase()}
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"></span>
                                </h3>
                                <p className="text-[7px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-1">
                                    <span className="w-2 h-[1px] bg-primary"></span>
                                    AI PROJECTION ENGINE V5.0
                                </p>
                            </div>
                        </div>
                        {marketType && (
                            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.2)]">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest italic drop-shadow-glow">{marketType} MODE</span>
                            </div>
                        )}
                    </div>

                    {/* MVP SECTION - NEW */}
                    {mvpName && (
                        <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-2xl border border-white/5 relative overflow-hidden group/mvp">
                            <div className="absolute -right-2 -top-2 text-white/5">
                                <Trophy className="w-16 h-16 rotate-12" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 p-[1px] shrink-0 shadow-lg relative z-10">
                                <div className="w-full h-full bg-black rounded-[0.7rem] flex items-center justify-center relative overflow-hidden">
                                    <Trophy className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                    <Sparkles className="w-2 h-2" />
                                    MVP PROJECTED
                                </p>
                                <p className="text-lg font-black text-white italic tracking-tighter leading-none">{mvpName}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        {displayItems.map((item: any, idx) => {
                            const isOver = item.value.toLowerCase().includes('over') || item.label.toLowerCase().includes('mas');
                            const isUnder = item.value.toLowerCase().includes('under') || item.label.toLowerCase().includes('menos');

                            return (
                                <div key={idx} className="group/item relative p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-300 hover:bg-white/[0.05]">
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                    <div className="text-center space-y-2">
                                        <div className="flex justify-center transform group-hover/item:scale-110 transition-transform duration-300">
                                            {item.icon ? (
                                                <item.icon className={clsx("w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]", item.color || "text-white")} />
                                            ) : (
                                                <Activity className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest truncate group-hover/item:text-primary transition-colors">{item.label}</p>
                                            <p className="text-lg font-black text-white italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 group-hover/item:from-white group-hover/item:to-white">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-2 relative z-10">
                        <div className="bg-gradient-to-r from-primary/10 via-black to-black rounded-2xl p-4 border border-primary/20 flex items-center gap-4 group/value relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/value:opacity-100 transition-opacity"></div>
                            <div className="bg-black/50 p-2 rounded-xl border border-primary/20">
                                <TrendingUp className="w-5 h-5 text-primary group-hover/value:rotate-12 transition-transform" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Confianza del Algoritmo</span>
                                    <span className="text-[10px] font-black text-primary italic drop-shadow-glow">{confidence}%</span>
                                </div>
                                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] relative">
                                        <div className="absolute top-0 bottom-0 right-0 w-4 bg-white/50 blur-md transform translate-x-full animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
