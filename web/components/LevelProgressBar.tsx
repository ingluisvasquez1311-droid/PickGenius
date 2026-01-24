"use client";

import { Flame, Star, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface LevelProgressBarProps {
    level: number;
    progress: number;
    points: number;
}

export function LevelProgressBar({ level, progress, points }: LevelProgressBarProps) {
    return (
        <div className="bg-[#080808] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">Nivel de Operador</span>
                            <Flame className="w-4 h-4 text-orange-500 animate-fire" />
                        </div>
                        <h3 className="text-4xl font-black italic text-white tracking-tighter uppercase">ELITE <span className="text-primary">LVL {level}</span></h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Puntos de Poder</p>
                        <p className="text-2xl font-black italic text-white tracking-tighter">{points.toLocaleString()} <span className="text-primary font-mono text-sm">XP</span></p>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Progreso de Rango</span>
                        <span>{progress}% para LVL {level + 1}</span>
                    </div>
                    <div className="relative h-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-1 shadow-inner group/bar">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>

                        <div
                            className="h-full bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30 mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>

                {/* Rank Benefits */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    {[
                        { label: 'Multiplicador', val: '1.2x', icon: Star },
                        { label: 'Señales Alpha', val: 'Activo', icon: Trophy },
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <benefit.icon className="w-4 h-4 text-primary/60" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{benefit.label}</span>
                                <span className="text-[10px] font-black text-white italic">{benefit.val}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
