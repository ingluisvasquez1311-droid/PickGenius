"use client";

import { useState } from 'react';
import {
    Scale, TrendingUp, AlertTriangle,
    Zap, Check, ExternalLink, Filter
} from 'lucide-react';
import clsx from 'clsx';

interface SureBet {
    id: string;
    event: string;
    league: string;
    outcome1: { bookmaker: string; odds: number; market: string };
    outcome2: { bookmaker: string; odds: number; market: string };
    profit: number; // Guaranteed profit percentage
    stake1: number;
    stake2: number;
    totalStake: number;
}

export default function SureBetsFinder() {
    const [minProfit, setMinProfit] = useState(2);
    const [selectedSport, setSelectedSport] = useState<'all' | 'football' | 'basketball' | 'tennis'>('all');

    // Simulated sure bets (In real app, this would come from API comparing multiple bookmakers)
    const sureBets: SureBet[] = [
        {
            id: '1',
            event: 'Lakers vs Celtics',
            league: 'NBA',
            outcome1: { bookmaker: 'Bet365', odds: 2.15, market: 'Lakers ML' },
            outcome2: { bookmaker: 'William Hill', odds: 2.20, market: 'Celtics ML' },
            profit: 2.3,
            stake1: 465.12,
            stake2: 534.88,
            totalStake: 1000
        },
        {
            id: '2',
            event: 'Real Madrid vs Barcelona',
            league: 'La Liga',
            outcome1: { bookmaker: 'Betway', odds: 2.80, market: 'Real Madrid ML' },
            outcome2: { bookmaker: 'Unibet', odds: 1.55, market: 'Draw/Barcelona' },
            profit: 3.1,
            stake1: 357.14,
            stake2: 642.86,
            totalStake: 1000
        },
        {
            id: '3',
            event: 'Djokovic vs Alcaraz',
            league: 'Australian Open',
            outcome1: { bookmaker: 'Pinnacle', odds: 1.95, market: 'Djokovic ML' },
            outcome2: { bookmaker: 'Marathonbet', odds: 2.10, market: 'Alcaraz ML' },
            profit: 2.5,
            stake1: 518.52,
            stake2: 481.48,
            totalStake: 1000
        }
    ];

    const filteredBets = sureBets.filter(bet => {
        const profitOk = bet.profit >= minProfit;
        const sportOk = selectedSport === 'all' ||
            (selectedSport === 'basketball' && bet.league.includes('NBA')) ||
            (selectedSport === 'football' && bet.league.includes('Liga')) ||
            (selectedSport === 'tennis' && bet.league.includes('Open'));
        return profitOk && sportOk;
    });

    return (
        <div className="glass-card p-1 rounded-[3rem] border-white/5">
            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <Scale className="w-5 h-5 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                SURE BETS <span className="text-green-500">FINDER</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Arbitraje Matemático • Profit Garantizado
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                                {filteredBets.length} Oportunidades
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Min Profit Filter */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-3 h-3" />
                                Profit Mínimo
                            </label>
                            <span className="text-xl font-black italic text-green-500">{minProfit}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={minProfit}
                            onChange={(e) => setMinProfit(Number(e.target.value))}
                            className="w-full accent-green-500 bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Sport Filter */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deporte</label>
                        <div className="flex gap-2">
                            {(['all', 'football', 'basketball', 'tennis'] as const).map(sport => (
                                <button
                                    key={sport}
                                    onClick={() => setSelectedSport(sport)}
                                    className={clsx(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        selectedSport === sport
                                            ? "bg-green-500 text-black"
                                            : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {sport === 'all' ? 'Todos' : sport}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sure Bets List */}
                <div className="space-y-4">
                    {filteredBets.length > 0 ? filteredBets.map((bet) => (
                        <div key={bet.id} className="p-6 bg-white/[0.02] border border-white/5 hover:border-green-500/30 rounded-[2rem] transition-all space-y-6 group">
                            {/* Event Info */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-black italic uppercase text-white group-hover:text-green-500 transition-colors">
                                        {bet.event}
                                    </p>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                        {bet.league}
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black italic text-green-500">+{bet.profit.toFixed(1)}</span>
                                        <span className="text-[10px] font-black text-green-500 uppercase">%</span>
                                    </div>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center">Profit</p>
                                </div>
                            </div>

                            {/* Two Outcomes Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[bet.outcome1, bet.outcome2].map((outcome, idx) => (
                                    <div key={idx} className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-white uppercase italic">{outcome.market}</span>
                                            <span className="px-2 py-1 bg-white/5 rounded-lg text-xs font-mono text-gray-400">@{outcome.odds}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Casa</p>
                                                <p className="text-sm font-bold text-gray-400">{outcome.bookmaker}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Stake</p>
                                                <p className="text-sm font-black italic text-white">
                                                    ${idx === 0 ? bet.stake1.toFixed(2) : bet.stake2.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase">
                                    <Check className="w-3 h-3 text-green-500" />
                                    Inversión Total: ${bet.totalStake}
                                </div>
                                <button className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-[10px] font-black text-green-500 uppercase tracking-widest transition-all flex items-center gap-2">
                                    Ejecutar Arbitraje
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                            <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
                                No hay sure bets disponibles con estos filtros
                            </p>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase">
                        <span className="text-yellow-500">Advertencia:</span> Las sure bets requieren cuentas en múltiples casas
                        de apuestas y pueden estar sujetas a límites o restricciones. Ejecutar bajo tu propio criterio.
                    </p>
                </div>
            </div>
        </div>
    );
}
