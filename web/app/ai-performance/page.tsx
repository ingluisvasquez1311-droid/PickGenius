"use client";

import { useState, useEffect } from 'react';
import {
    Trophy, TrendingUp, Target, Activity,
    CheckCircle, XCircle, Calendar, ArrowLeft,
    Zap, Shield, Search, Filter
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function AiPerformancePage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPerformance = async (filter: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/performance?filter=${filter}`);
            const data = await res.json();
            setPerformanceData(data);
        } catch (e) {
            console.error("Error fetching performance:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance(activeFilter);
    }, [activeFilter]);

    if (loading && !performanceData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronizando Historial Pro...</p>
                </div>
            </div>
        );
    }

    const { stats, sportsPerformance, history } = performanceData || {
        stats: { totalPredictions: 0, accuracy: '0%', roi: '0%', profitUnit: '0u' },
        sportsPerformance: [],
        history: []
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[200px]"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-600/5 blur-[180px]"></div>
                <div className="absolute inset-0 checkered-bg opacity-[0.02]"></div>
            </div>

            <main className="relative z-10 pt-32 pb-32 px-4 md:px-12 max-w-[90rem] mx-auto space-y-16">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Regresar
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            AI <span className="text-primary">PORTFOLIO</span>
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs max-w-xl">
                            Transparencia radical. Cada predicción registrada. Historial inmutable de rendimiento v2.0.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center min-w-[140px]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Precisión Global</p>
                            <p className="text-4xl font-black text-white italic">{stats.accuracy}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center min-w-[140px]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ROI Mensual</p>
                            <p className="text-4xl font-black text-green-500 italic">{stats.roi}</p>
                        </div>
                    </div>
                </div>

                {/* Breakdown by Sport */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-xl">Rendimiento por Deporte</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {sportsPerformance.map((sport: any) => {
                            const IconMap: any = {
                                'football': Target,
                                'nba': Activity,
                                'tennis': Trophy,
                                'nfl': Shield,
                                'mlb': Zap
                            };
                            const Icon = IconMap[sport.id] || Target;
                            return (
                                <div key={sport.id} className="bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all p-6 rounded-3xl group">
                                    <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", sport.bg, sport.color)}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-black text-white uppercase tracking-tighter text-lg">{sport.name}</h4>
                                    <p className={clsx("text-2xl font-black italic mt-1", sport.color)}>{sport.accuracy}</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">{sport.picks} Picks</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Verification Log */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-white/5">
                        <div className="space-y-1">
                            <h3 className="font-black text-white uppercase italic tracking-tighter text-3xl">Registro de Verificación</h3>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Últimos movimientos del oráculo</p>
                        </div>

                        <div className="flex gap-2">
                            {['all', 'nba', 'football', 'tennis'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={clsx(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeFilter === filter ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {history
                            .filter((item: any) => activeFilter === 'all' || item.sport === activeFilter)
                            .map((item: any) => (
                                <div key={item.id} className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all">

                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                            item.result === 'win' ? "bg-green-500/10 text-green-500" :
                                                item.result === 'loss' ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-400"
                                        )}>
                                            {item.result === 'win' ? <CheckCircle className="w-6 h-6" /> :
                                                item.result === 'loss' ? <XCircle className="w-6 h-6" /> : <Activity className="w-6 h-6 animate-pulse" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-gray-400">{item.sport}</span>
                                                <span className="text-[10px] font-mono text-gray-600">{item.date}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white uppercase italic tracking-wide">{item.match}</h4>
                                            <p className="text-sm font-medium text-primary mt-0.5">{item.pick} <span className="text-gray-500 text-xs">@ {item.odds}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Confianza IA</p>
                                            <div className="flex gap-0.5 justify-end mt-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <div key={star} className={clsx(
                                                        "w-1.5 h-4 rounded-full skew-x-[-10deg]",
                                                        star <= 4 ? "bg-primary" : "bg-white/10"
                                                    )}></div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Estado</p>
                                            <p className={clsx(
                                                "text-sm font-black uppercase italic tracking-wider",
                                                item.result === 'win' ? "text-green-500" :
                                                    item.result === 'loss' ? "text-red-500" : "text-yellow-500"
                                            )}>
                                                {item.result === 'pending' ? 'EN JUEGO' : item.result.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
