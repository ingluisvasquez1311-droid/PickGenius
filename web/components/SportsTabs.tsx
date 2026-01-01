"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Activity, Target, Zap, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const sports = [
    { id: 'football', name: 'Fútbol', icon: Globe, label: 'LTP / LIVE' },
    { id: 'basketball', name: 'NBA', icon: Activity, label: 'FULL SEASON' },
    { id: 'nfl', name: 'NFL', icon: Target, label: 'PLAYOFFS', key: 'american-football' },
    { id: 'hockey', name: 'NHL', icon: Zap, label: 'PRO-ICE' },
    { id: 'baseball', name: 'MLB', icon: Star, label: 'WORLD SERIES' },
];

const sportsContent: Record<string, any> = {
    football: {
        title: "SISTEMA DE FÚTBOL IA",
        desc: "Análisis especializado en Premier League, La Liga y torneos internacionales con una precisión del 94%.",
        features: ["Radar en Vivo v4.0", "Predictores de Córners", "Algoritmo de Goles Esperados (xG)"]
    },
    basketball: {
        title: "NBA QUANT ENGINE",
        desc: "Predicciones de Player Props y Spreads basadas en modelos de machine learning de alta frecuencia.",
        features: ["Prop Consistency Matrix", "Line Movement Alerts", "Matchup Edge Analysis"]
    },
    nfl: {
        title: "NFL STRATEGY HUB",
        desc: "Análisis de jugadas y condiciones climáticas para predicciones de alta fidelidad en NFL.",
        features: ["Yardage Projection", "Touchdown Probability", "Defensive Efficiency Stats"]
    },
    hockey: {
        title: "NHL ICE INSIGHTS",
        desc: "Tracking de rendimiento de porteros y eficiencia de power play en tiempo real.",
        features: ["Goalie Performance", "Power Play Odds", "Shots on Goal Matrix"]
    },
    baseball: {
        title: "MLB DATA TERMINAL",
        desc: "Comparativas de lanzadores y promedios de bateo para maximizar beneficios en cada entrada.",
        features: ["Pitcher Matchups", "Batting Averages", "Situational Stats"]
    }
};

export const SportsTabs = () => {
    const [activeTab, setActiveTab] = useState('football');
    const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await fetch('/api/live/counts');
                if (res.ok) {
                    const data = await res.json();
                    setLiveCounts(data);
                }
            } catch (error) {
                console.error('Error fetching live counts:', error);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-12">
            {/* Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4 border-b border-white/10 no-scrollbar">
                {sports.map((sport) => {
                    const count = liveCounts[sport.key || sport.id] || 0;
                    return (
                        <button
                            key={sport.id}
                            onClick={() => setActiveTab(sport.id)}
                            className={clsx(
                                "flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap relative group",
                                activeTab === sport.id
                                    ? "bg-white/10 text-primary border-b-2 border-primary"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <sport.icon className={clsx("w-4 h-4", activeTab === sport.id ? "text-primary" : "text-gray-600")} />
                            {sport.name}
                            {count > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-600 text-white rounded-md text-[9px] animate-pulse">
                                    {count} LIVE
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid md:grid-cols-2 gap-8 items-center bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                    <div className="space-y-6 relative z-10">
                        <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                            {sportsContent[activeTab].title}
                        </h3>
                        <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                            {sportsContent[activeTab].desc}
                        </p>
                        <div className="space-y-3">
                            {sportsContent[activeTab].features.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <Link
                            href={activeTab === 'nba' ? '/basketball' : activeTab === 'mlb' ? '/baseball' : activeTab === 'nhl' ? '/hockey' : `/${activeTab}`}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest transition-all mt-4 hover:border-primary hover:text-primary group"
                        >
                            Explorar Radar {sports.find(s => s.id === activeTab)?.name}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="hidden md:flex justify-center items-center relative">
                        <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-75 animate-pulse" />
                        {React.createElement(sports.find(s => s.id === activeTab)?.icon || Globe, {
                            className: "w-48 h-48 text-primary opacity-20 relative z-10 animate-float"
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
