'use client';

import React, { useEffect, useState } from 'react';
import { valueBetsService, ValueBet } from '@/lib/services/valueBetsService';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function ValueBetsPage() {
    const [bets, setBets] = useState<ValueBet[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const isPremium = user?.isPremium || false;

    useEffect(() => {
        const loadBets = async () => {
            const data = await valueBetsService.getValueBets();
            setBets(data.sort((a, b) => b.edge - a.edge)); // Best value first
            setLoading(false);
        };
        loadBets();
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30 pb-20 pt-24">
            <Navbar />

            {/* Header */}
            <header className="relative py-12 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        AI Live Scanner
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                        VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-700">HUNTER</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Nuestro algoritmo detecta discrepancias matemáticas donde las casas de apuestas <span className="text-white font-bold">se equivocan</span>.
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-5xl">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-[#111] rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bets.map((bet) => (
                            <ValueBetCard key={bet.id} bet={bet} isPremium={isPremium} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

const ValueBetCard = ({ bet, isPremium }: { bet: ValueBet; isPremium: boolean }) => {
    const getBookmakerLogo = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('bet365')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Bet365_Logo.svg';
        if (n.includes('pinnacle')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pinnacle_Sports_Logo.svg';
        if (n.includes('1xbet')) return 'https://upload.wikimedia.org/wikipedia/commons/3/3e/1xBet_Logo.svg';
        if (n.includes('betfair')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Betfair_Logo.svg';
        if (n.includes('william')) return 'https://upload.wikimedia.org/wikipedia/commons/0/07/William_Hill_Logo.svg';
        return '/logo-mock-bookie.png'; // Fallback
    };

    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all duration-300">
            {/* Edge Ribbon */}
            <div className="absolute top-0 left-0 bg-green-500 text-black text-xs font-black px-3 py-1 rounded-br-xl z-20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                +{bet.edge.toFixed(1)}% EDGE
            </div>

            <div className="flex flex-col md:flex-row items-stretch">

                {/* Visual Side Match Info */}
                <div className="p-6 flex-1 flex flex-col justify-center relative">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                        <span>{bet.sport === 'football' ? 'Fútbol' : bet.sport === 'basketball' ? 'Baloncesto' : bet.sport}</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span>{bet.league}</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                        {bet.homeTeam} <span className="text-gray-600 text-sm">vs</span> {bet.awayTeam}
                    </div>
                    <div className="text-sm text-gray-400 font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {new Date(bet.startTime).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* The "Pick" Side - BLURRED IF NOT PREMIUM */}
                <div className="relative p-6 md:w-[400px] bg-[#111] flex flex-col justify-center border-l border-white/5">

                    {!isPremium && (
                        <div className="absolute inset-0 z-30 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center border-l border-green-500/20">
                            <div className="mb-2 text-3xl">🔒</div>
                            <h3 className="text-white font-bold mb-1 tracking-tight">OPORTUNIDAD PREMIUM</h3>
                            <p className="text-xs text-gray-400 mb-4 max-w-[200px]">
                                Desbloquea esta apuesta de valor con <span className="text-green-400 font-bold">+{bet.edge.toFixed(1)}% de rentabilidad</span> teórica.
                            </p>
                            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:scale-105 transition-transform shadow-lg shadow-green-900/20">
                                Desbloquear Pick
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">MERCADO</div>
                            <div className="text-white font-bold text-sm">{bet.market}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">CUOTA REAL</div>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 tabular-nums">
                                {bet.odds.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-center justify-between mb-3 border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Tu Apuesta</span>
                            <span className="text-lg font-bold text-white tracking-tight">{bet.selection}</span>
                        </div>
                        <div className="h-8 w-20 flex items-center justify-center bg-white/5 rounded px-2">
                            {/* Logo handling */}
                            {getBookmakerLogo(bet.bookmaker) !== '/logo-mock-bookie.png' ? (
                                <img src={getBookmakerLogo(bet.bookmaker)} alt={bet.bookmaker} className="max-h-6 max-w-full object-contain" />
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{bet.bookmaker}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono bg-black/30 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">IA:</span>
                            <span className="text-green-400 font-bold">{bet.aiProbability}%</span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Implícita:</span>
                            <span className="text-gray-300">{bet.impliedProbability.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
