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

interface PremiumProjectionCardProps {
    sport: SportType;
    projections: Projections;
    isVisible: boolean;
    confidence?: number;
}

export const PremiumProjectionCard = ({ sport, projections, isVisible, confidence = 85 }: PremiumProjectionCardProps) => {
    if (!isVisible) return null;

    // Default items by sport if projections are missing
    const getDefaults = (s: SportType) => {
        switch (s) {
            case 'basketball':
                return [
                    { label: 'Puntos Tot.', value: '220-225', icon: Target, color: 'text-orange-500' },
                    { label: 'Rebotes', value: '42-45', icon: Activity, color: 'text-blue-400' },
                    { label: 'Triples', value: '12-15', icon: Zap, color: 'text-yellow-400' },
                ];
            case 'baseball':
                return [
                    { label: 'Carreras', value: '8-10', icon: Trophy, color: 'text-white' },
                    { label: 'Hits', value: '15-18', icon: Activity, color: 'text-blue-400' },
                    { label: 'Strikeouts', value: '12-14', icon: Zap, color: 'text-primary' },
                ];
            case 'nfl':
                return [
                    { label: 'Puntos', value: '48-52', icon: Target, color: 'text-red-500' },
                    { label: 'Yardas Aire', value: '280+', icon: Activity, color: 'text-blue-400' },
                    { label: 'TDs', value: '5-6', icon: Zap, color: 'text-yellow-400' },
                ];
            case 'tennis':
                return [
                    { label: 'Aces', value: '10-12', icon: Zap, color: 'text-yellow-400' },
                    { label: 'Dobles F.', value: '3-4', icon: ShieldAlert, color: 'text-red-500' },
                    { label: 'Breaks', value: '4-5', icon: Target, color: 'text-primary' },
                ];
            default: // football / soccer
                return [
                    { label: 'Córners', value: '8-10', icon: Target, color: 'text-primary' },
                    { label: 'Tiros Arco', value: '10-12', icon: Zap, color: 'text-blue-400' },
                    { label: 'Tarjetas', value: '3-4', icon: ShieldAlert, color: 'text-red-500' },
                ];
        }
    };

    const displayItems = [
        projections.item1 || getDefaults(sport)[0],
        projections.item2 || getDefaults(sport)[1],
        projections.item3 || getDefaults(sport)[2],
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 duration-700">
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-600 to-red-600 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                <div className="relative glass-card bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-6 shadow-2xl space-y-5 min-w-[340px]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/20">
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">Radar {sport.toUpperCase()}</h3>
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Proyección IA v4.0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Live Edge</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {displayItems.map((item: any, idx) => (
                            <div key={idx} className="text-center space-y-2 group/item">
                                <div className="flex justify-center">
                                    {item.icon ? <item.icon className={clsx("w-5 h-5", item.color || "text-white")} /> : <Activity className="w-5 h-5 text-primary" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest truncate">{item.label}</p>
                                    <p className="text-lg font-black text-white italic tracking-tighter group-hover/item:scale-110 transition-transform">
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 flex items-center gap-3 group/value">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Confianza del Algoritmo</span>
                                    <span className="text-[9px] font-black text-primary italic">{confidence}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-primary shadow-glow-sm`} style={{ width: `${confidence}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
