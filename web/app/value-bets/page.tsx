'use client';

import React, { useEffect, useState } from 'react';
import { valueBetsService, ValueBet } from '@/lib/services/valueBetsService';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function ValueBetsPage() {
    const [bets, setBets] = useState<ValueBet[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const isPremium = user?.isPremium || user?.role === 'admin' || false;

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
                        {bets.length > 0 ? (
                            bets.map((bet) => (
                                <ValueBetCard key={bet.id} bet={bet} isPremium={isPremium} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">No se detectaron discrepancias en este momento</p>
                            </div>
                        )}
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
            <div className="absolute top-0 left-0 bg-green-500 text-black text-[10px] font-black px-4 py-1.5 rounded-br-2xl z-20 shadow-[0_0_20px_rgba(34,197,94,0.3)] uppercase italic tracking-tighter">
                +{bet.edge.toFixed(1)}% EDGE
            </div>

            <div className="flex flex-col md:flex-row items-stretch">

                {/* Visual Side Match Info */}
                <div className="p-8 flex-1 flex flex-col justify-center relative">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <span className="text-green-500">
                            {bet.sport === 'football' ? '⚽ FÚTBOL' : bet.sport === 'basketball' ? '🏀 NBA' : bet.sport}
                        </span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span>{bet.league}</span>
                    </div>
                    <div className="text-2xl font-black text-white mb-3 flex items-center gap-4 italic tracking-tighter">
                        {bet.homeTeam} <span className="text-gray-700 text-sm not-italic opacity-50">VS</span> {bet.awayTeam}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {new Date(bet.startTime).toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </div>
                </div>

                {/* The "Pick" Side - BLURRED IF NOT PREMIUM */}
                <div className="relative p-8 md:w-[450px] bg-[#111]/50 flex flex-col justify-center border-l border-white/5">

                    {!isPremium && (
                        <div className="absolute inset-0 z-30 backdrop-blur-[12px] bg-black/70 flex flex-col items-center justify-center p-8 text-center border-l border-green-500/20">
                            <div className="mb-4 text-4xl">💎</div>
                            <h3 className="text-white font-black mb-2 tracking-tighter text-xl italic">OPORTUNIDAD EXCLUSIVA</h3>
                            <p className="text-[10px] text-gray-400 mb-6 max-w-[220px] leading-relaxed">
                                Este algoritmo detectó una discrepancia de <span className="text-green-400 font-black">+{bet.edge.toFixed(1)}%</span>. Desbloquea el análisis completo.
                            </p>
                            <button
                                onClick={() => window.location.href = '/pricing'}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-black px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-xl shadow-green-900/40 uppercase tracking-widest"
                            >
                                Desbloquear Pick
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">MERCADO</div>
                            <div className="text-white font-black text-lg italic tracking-tighter">{bet.market}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">CUOTA DETECTADA</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 tabular-nums italic">
                                {bet.odds.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] rounded-2xl p-4 flex items-center justify-between mb-4 border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 uppercase font-black mb-1">Selección Genius</span>
                            <span className="text-xl font-black text-white tracking-widest italic">{bet.selection}</span>
                        </div>
                        <div className="h-10 w-24 flex items-center justify-center bg-white/5 rounded-xl px-3 border border-white/5">
                            {/* Logo handling */}
                            {getBookmakerLogo(bet.bookmaker) !== '/logo-mock-bookie.png' ? (
                                <img src={getBookmakerLogo(bet.bookmaker)} alt={bet.bookmaker} className="max-h-6 max-w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                            ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase italic opacity-50">{bet.bookmaker}</span>
                            )}
                        </div>
                    </div>

                    {/* INTERNAL STRATEGY BREAKDOWN - Requested by user */}
                    <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Desglose de Estrategia</span>
                            <span className="text-[10px] font-mono text-gray-600">ID: {bet.id.slice(-5).toUpperCase()}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500">Línea Combinada Interna</span>
                                <span className="text-white font-bold">Inyectada</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500">Probabilidad Real IA</span>
                                <span className="text-green-400 font-bold">{bet.aiProbability}%</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-600 italic mt-3 leading-tight border-t border-white/5 pt-3">
                            * Ingresa en la casa de apuesta y verifica si es una <span className="text-white font-bold">línea simple</span> o una <span className="text-white font-bold">combinación interna</span> para esta cuota específica.
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-600">RATING:</span>
                            <span className="text-green-400 font-black">{bet.confidenceScore}/10</span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-600">IMPLICADA:</span>
                            <span className="text-gray-400">{bet.impliedProbability.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
