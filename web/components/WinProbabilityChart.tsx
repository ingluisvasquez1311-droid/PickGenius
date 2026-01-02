"use client";

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

interface WinProbabilityChartProps {
    incidents: any[];
    homeTeam: string;
    awayTeam: string;
    currentStatus: string; // 'inprogress', 'notstarted', etc.
}

export default function WinProbabilityChart({ incidents, homeTeam, awayTeam, currentStatus }: WinProbabilityChartProps) {
    if (currentStatus === 'notstarted' || !incidents || incidents.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center bg-white/5 rounded-3xl border border-white/5 mt-6">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                    Esperando inicio del partido para trazar probabilidad...
                </p>
            </div>
        );
    }

    // Lógica para transformar incidentes en puntos de probabilidad
    // Probabilidad base: 50 (50% Local, 50% Visitante)
    // El eje Y irá de 0 (100% Visitante) a 100 (100% Local)

    const generateData = () => {
        let currentProb = 50;
        const data = [{ time: '0\'', prob: 50 }];

        // Ordenar incidentes por tiempo (Sofascore suele mandarlos cronológicamente pero por si acaso)
        const sortedIncidents = [...incidents].sort((a, b) => (a.time || 0) - (b.time || 0));

        sortedIncidents.forEach((inc) => {
            const timeStr = `${inc.time}'`;

            // Impacto según tipo de incidente
            if (inc.incidentType === 'goal') {
                if (inc.isHome) currentProb += 25;
                else currentProb -= 25;
            } else if (inc.incidentType === 'card' && inc.incidentClass === 'red') {
                if (inc.isHome) currentProb -= 20;
                else currentProb += 20;
            } else if (inc.incidentType === 'period') {
                // Ajuste leve al final de tiempos
            }

            // Limitar entre 5% y 95% para realismo
            currentProb = Math.max(5, Math.min(95, currentProb));

            data.push({ time: timeStr, prob: currentProb });
        });

        // Punto actual
        data.push({ time: 'Hoy', prob: currentProb });

        return data;
    };

    const chartData = generateData();

    return (
        <div className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
            <div className="flex justify-between items-center px-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(var(--primary-rgb),0.8)]" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-glow">Live Win Probability</h4>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Real-time Analysis</p>
                    </div>
                </div>
                <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span className="text-gray-300">{homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span className="text-gray-500">{awayTeam}</span>
                    </div>
                </div>
            </div>

            <div className="h-72 w-full glass-card rounded-[2.5rem] border border-white/10 p-1 relative overflow-hidden group hover:cyber-border transition-all duration-500">
                {/* Chart Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[2.3rem]"></div>

                <div className="absolute inset-6 rounded-2xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="#ffffff30"
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                tick={{ fill: '#6b7280', fontSize: 9, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                hide
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(5, 5, 5, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    color: '#fff',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                itemStyle={{ color: '#22c55e', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 700 }}
                                formatter={(value: any) => [`${value}% Win Prob`, 'Local Check']}
                            />
                            <ReferenceLine y={50} stroke="#ffffff20" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="prob"
                                stroke="#22c55e"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorProb)"
                                animationDuration={2000}
                                style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.3))' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Overlay Labels */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none opacity-50">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em]">{homeTeam} ZONE</span>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none opacity-50">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em]">{awayTeam} ZONE</span>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" />
                        Estimación probabilística basada en momentum
                    </p>
                </div>
            </div>
        </div>
    );
}
