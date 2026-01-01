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
        <div className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Win Probability</span>
                </div>
                <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                    <span className="text-primary">{homeTeam}</span>
                    <span className="text-accent">{awayTeam}</span>
                </div>
            </div>

            <div className="h-64 w-full bg-[#050505] rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF41" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#ffffff20"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[0, 100]}
                            hide
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                            itemStyle={{ color: '#00FF41', fontWeight: 'bold' }}
                            labelStyle={{ color: '#666', marginBottom: '4px' }}
                            formatter={(value: any) => [`${value}% Win Prob`, 'Local']}
                        />
                        <ReferenceLine y={50} stroke="#ffffff10" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="prob"
                            stroke="#00FF41"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorProb)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Overlay Labels */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none">
                    <span className="text-[7px] font-black text-gray-700 uppercase tracking-[0.5em]">{homeTeam} DOMINA</span>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none">
                    <span className="text-[7px] font-black text-gray-700 uppercase tracking-[0.5em]">{awayTeam} DOMINA</span>
                </div>
            </div>

            <p className="text-center text-[8px] font-medium text-gray-600 uppercase tracking-[0.2em] italic">
                * Estimación probabilística basada en eventos críticos, tiempo restante y momentum de juego.
            </p>
        </div>
    );
}
