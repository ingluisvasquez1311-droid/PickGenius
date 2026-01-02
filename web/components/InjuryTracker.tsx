"use client";

import { useState, useEffect } from 'react';
import {
    Activity, AlertTriangle, ShieldCheck,
    Stethoscope, Zap, ChevronRight,
    TrendingDown, Info, Clock, AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

interface InjuryAlert {
    player: string;
    team: string;
    status: string;
    injury: string;
    bettingImpact: string;
}

interface InjuryReport {
    lastUpdated: string;
    criticalAlerts: InjuryAlert[];
    generalSummary: string;
}

export default function InjuryTracker({ sport = 'basketball' }: { sport?: string }) {
    const { data, isLoading } = useQuery<InjuryReport>({
        queryKey: ['injury-report', sport],
        queryFn: async () => {
            const res = await fetch(`/api/ai/injuries?sport=${sport}`);
            return res.json();
        },
        refetchInterval: 1000 * 60 * 15 // Every 15 minutes
    });

    if (isLoading) {
        return (
            <div className="p-1 rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse h-64 overflow-hidden">
                <div className="h-full w-full bg-black/40 rounded-[2.3rem] flex items-center justify-center">
                    <Activity className="w-8 h-8 text-primary/20 animate-bounce" />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-1 rounded-[3rem] border-white/5 bg-white/[0.02]">
            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-10 space-y-8 overflow-hidden relative">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">I.A. <span className="text-red-500">MEDICAL INSIGHTS</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            ÚLTIMA ACTUALIZACIÓN: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'AHORA'}
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Análisis Biométrico v2.0</span>
                    </div>
                </div>

                {/* Summary */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative z-10 group hover:border-red-500/30 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-red-500/10 transition-colors">
                            <Activity className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 italic leading-relaxed uppercase tracking-tight">
                            {data?.generalSummary}
                        </p>
                    </div>
                </div>

                {/* Critical Alerts List */}
                <div className="space-y-4 relative z-10">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Alertas Críticas de Bajas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.criticalAlerts.map((alert, i) => (
                            <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-[2rem] hover:border-red-500/40 transition-all space-y-4 group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black italic uppercase text-white group-hover:text-red-500 transition-colors">{alert.player}</p>
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{alert.team}</p>
                                    </div>
                                    <div className={clsx(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        alert.status.toLowerCase().includes('baja') ? "bg-red-600 text-white" : "bg-orange-500/20 text-orange-500"
                                    )}>
                                        {alert.status}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        <span>{alert.injury}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase">
                                            <TrendingDown className="w-3 h-3" />
                                            Impacto en el Mercado
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">{alert.bettingImpact}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 justify-center">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-red-600" /> Confirmado Fuera
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-orange-500" /> Decisión de Juego
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Alta Médica
                    </div>
                </div>

            </div>
        </div>
    );
}
