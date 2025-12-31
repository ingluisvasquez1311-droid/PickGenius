"use client";

import { useState } from 'react';
import clsx from 'clsx';
import { Target, Info } from 'lucide-react';

interface PropConsistencyMatrixProps {
    matches: any[];
    playerName: string;
    sport: string;
}

export default function PropConsistencyMatrix({ matches, playerName, sport }: PropConsistencyMatrixProps) {
    const isBasketball = sport === 'basketball';

    // Default categories to track
    const categories = isBasketball
        ? [
            { id: 'points', label: 'PTS', defaultLine: 24.5 },
            { id: 'assists', label: 'AST', defaultLine: 7.5 },
            { id: 'totalRebounds', label: 'REB', defaultLine: 9.5 }
        ]
        : [
            { id: 'goals', label: 'GOL', defaultLine: 0.5 },
            { id: 'totalShots', label: 'TIROS', defaultLine: 2.5 },
            { id: 'accuratePass', label: 'PASES', defaultLine: 45.5 }
        ];

    const [selectedCat, setSelectedCat] = useState(categories[0]);
    const [line, setLine] = useState(categories[0].defaultLine);

    // Calculate hits
    const results = matches.map(m => {
        const stats = m.playerStats;
        if (!stats) return null;
        const val = stats[selectedCat.id] || 0;
        return {
            val,
            isHit: val > line,
            date: new Date(m.startTimestamp * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            opponent: m.homeTeam.name === matches[0]?.playerStats?.team?.name ? m.awayTeam.name : m.homeTeam.name
        };
    }).filter(Boolean);

    const hitCount = results.filter(r => r?.isHit).length;
    const hitRate = Math.round((hitCount / results.length) * 100) || 0;

    return (
        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Matriz de Consistencia
                    </h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Análisis de rendimiento vs Línea de apuesta</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCat(cat);
                                setLine(cat.defaultLine);
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedCat.id === cat.id ? "bg-primary text-black" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Line Adjustment Control */}
            <div className="flex items-center gap-4 mb-8 bg-white/[0.02] p-4 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ajustar Línea:</span>
                <input
                    type="range"
                    min="0.5"
                    max={isBasketball ? 60.5 : 5.5}
                    step="1"
                    value={line}
                    onChange={(e) => setLine(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xl font-black italic text-primary w-12 text-center">{line}</span>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-8">
                {results.map((res, i) => (
                    <div
                        key={i}
                        className={clsx(
                            "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all group relative cursor-help",
                            res?.isHit
                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                        )}
                    >
                        <span className="text-lg font-black italic">{res?.val}</span>
                        <span className="text-[8px] font-bold opacity-50 uppercase">{res?.date}</span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-black border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-2xl">
                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">vs {res?.opponent}</p>
                            <p className="text-xs font-bold text-white leading-none">
                                {res?.isHit ? 'CUBRIÓ ✅' : 'NO CUBRIÓ ❌'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Hit Rate (Last {results.length})</p>
                    <p className={clsx("text-4xl font-black italic", hitRate > 60 ? "text-green-400" : "text-white")}>
                        {hitRate}%
                    </p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Frecuencia</p>
                    <p className="text-4xl font-black italic text-white">
                        {hitCount}<span className="text-sm text-gray-500">/{results.length}</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-blue-600/20 p-6 rounded-3xl border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-primary" />
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Pro Tip</p>
                    </div>
                    <p className="text-xs font-bold text-gray-400 leading-tight">
                        {hitRate > 70
                            ? "Jugador extremadamente consistente en esta línea. Tendencia fuerte."
                            : "Volatilidad detectada. Revisar si el rival tiene buena defensa en esta zona."}
                    </p>
                </div>
            </div>
        </div>
    );
}
