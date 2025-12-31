"use client";

import { useState } from 'react';
import {
    Trophy, TrendingUp, Target, Activity,
    CheckCircle, XCircle, Calendar, ArrowLeft,
    Zap, Shield, Search, Filter
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function AiPerformancePage() {
    const [activeFilter, setActiveFilter] = useState('all');

    // Mock Overall Stats
    const stats = {
        totalPredictions: 1240,
        accuracy: '76.8%',
        roi: '+18.4%',
        profitUnit: '+340u'
    };

    // Mock Performance by Sport
    const sportsPerformance = [
        { id: 'football', name: 'Fútbol', accuracy: '72%', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Target },
        { id: 'nba', name: 'NBA', accuracy: '81%', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Activity },
        { id: 'tennis', name: 'Tenis', accuracy: '68%', color: 'text-green-500', bg: 'bg-green-500/10', icon: Trophy },
        { id: 'nfl', name: 'NFL', accuracy: '79%', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Shield },
        { id: 'mlb', name: 'Béisbol', accuracy: '65%', color: 'text-red-500', bg: 'bg-red-500/10', icon: Zap },
    ];

    // Mock Recent History Log
    const history = [
        { id: 1, date: 'Hoy', match: 'Lakers vs Suns', pick: 'Lakers -3.5', odds: 1.90, result: 'pending', sport: 'nba' },
        { id: 2, date: 'Hoy', match: 'Real Madrid vs Sevilla', pick: 'Over 2.5 Goles', odds: 1.70, result: 'win', sport: 'football' },
        { id: 3, date: 'Ayer', match: 'Chiefs vs Bills', pick: 'Mahomes +250 yds', odds: 1.85, result: 'win', sport: 'nfl' },
        { id: 4, date: 'Ayer', match: 'Djokovic vs Sinner', pick: 'Sinner Win', odds: 2.10, result: 'loss', sport: 'tennis' },
        { id: 5, date: '28/12', match: 'Celtics vs Bucks', pick: 'Under 230.5', odds: 1.90, result: 'win', sport: 'nba' },
        { id: 6, date: '28/12', match: 'Arsenal vs Chelsea', pick: 'BTTS - Yes', odds: 1.65, result: 'win', sport: 'football' },
    ];

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
                        {sportsPerformance.map((sport) => (
                            <div key={sport.id} className="bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all p-6 rounded-3xl group">
                                <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", sport.bg, sport.color)}>
                                    <sport.icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-black text-white uppercase tracking-tighter text-lg">{sport.name}</h4>
                                <p className={clsx("text-2xl font-black italic mt-1", sport.color)}>{sport.accuracy}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">{Math.floor(Math.random() * 200) + 50} Picks</p>
                            </div>
                        ))}
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
                            .filter(item => activeFilter === 'all' || item.sport === activeFilter)
                            .map((item) => (
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
