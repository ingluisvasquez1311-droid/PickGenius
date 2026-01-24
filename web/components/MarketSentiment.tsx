"use client";

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, Activity, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Mock data for sentiment - in a real app, this would come from an API tracking exchange volume
const MOCK_SENTIMENT = [
    { id: 1, event: 'Lakers vs Celtics', public: 78, sharp: 22, volume: '$1.2M', sharpSide: 'Celtics' },
    { id: 2, event: 'Chiefs vs Bills', public: 45, sharp: 85, volume: '$3.5M', sharpSide: 'Chiefs' },
    { id: 3, event: 'Real Madrid vs City', public: 60, sharp: 65, volume: '$5.8M', sharpSide: 'City' },
    { id: 4, event: 'Djokovic vs Sinner', public: 30, sharp: 70, volume: '$800K', sharpSide: 'Sinner' },
];

export function MarketSentiment() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            Sentimiento <span className="text-indigo-400">del Mercado</span>
                        </h2>
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Dinero Público vs. Dinero Inteligente (Sharps)
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Público</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Sharps (Pro)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_SENTIMENT.map((item) => (
                    <div key={item.id} className="relative group bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 p-6 rounded-[2rem] transition-all duration-500 hover:-translate-y-1">

                        {/* Event Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-black italic text-white uppercase leading-tight mb-1">{item.event}</h3>
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Vol: {item.volume}</p>
                            </div>
                            {item.sharp > 60 && (
                                <div className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                                    Sharp Signal
                                </div>
                            )}
                        </div>

                        {/* Sentiment Bars */}
                        <div className="space-y-4">
                            {/* Public Bar */}
                            <div className="space-y-1 group/bar">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Público</span>
                                    <span className="text-red-400">{item.public}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.public}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                    />
                                </div>
                            </div>

                            {/* Sharp Bar */}
                            <div className="space-y-1 group/bar">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Sharps</span>
                                    <span className="text-indigo-400">{item.sharp}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.sharp}%` }}
                                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analysis Footer */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Smart Play:</span>
                            <span className="text-xs font-black italic text-white uppercase">{item.sharpSide}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-indigo-400" />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    El "Dinero Inteligente" (Sharps) suele indicar movimientos de profesionales, mientras que el Público suele perseguir favoritos.
                </p>
            </div>
        </div>
    );
}
