'use client';

import React, { useEffect, useState } from 'react';
import { valueBetsService, ValueBet } from '@/lib/services/valueBetsService';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function ValueBetsPage() {
    const [bets, setBets] = useState<ValueBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'football' | 'basketball'>('all');
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
            <header className="relative py-8 lg:py-16 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-green-500/10 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                        <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500"></span>
                        AI Live Scanner
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter mb-4 leading-none">
                        VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-700">HUNTER</span>
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-sm lg:text-lg px-4 lg:px-0">
                        Detectamos discrepancias matemáticas donde las casas de apuestas <span className="text-white font-bold">se equivocan</span>.
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="container mx-auto px-4 mb-8">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                    <button
                        onClick={() => setFilter('all')}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('football')}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'football' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                    >
                        ⚽ Fútbol
                    </button>
                    <button
                        onClick={() => setFilter('basketball')}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'basketball' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                    >
                        🏀 Básquet
                    </button>
                </div>
            </div>

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
                        {bets.filter(b => filter === 'all' || b.sport === filter).length > 0 ? (
                            bets
                                .filter(b => filter === 'all' || b.sport === filter)
                                .map((bet) => (
                                    <ValueBetCard key={bet.id} bet={bet} isPremium={isPremium} />
                                ))
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">No se detectaron discrepancias</p>
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
        if (n.includes('betano')) return 'https://logos-world.net/wp-content/uploads/2023/12/Betano-Logo.png';
        if (n.includes('pinnacle')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pinnacle_Sports_Logo.svg';
        if (n.includes('betfair')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Betfair_Logo.svg';
        if (n.includes('rushbet')) return 'https://rushbet.co/static/media/logo.09a3028d.svg';
        return null;
    };

    const logo = getBookmakerLogo(bet.bookmaker);

    return (
        <div className="group relative bg-white/[0.02] border border-white/5 rounded-3xl lg:rounded-[2rem] overflow-hidden hover:border-green-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)]">
            {/* Edge Badge - High Impact */}
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-20">
                <div className="flex flex-col">
                    <span className="text-[8px] lg:text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Algorithmic Edge</span>
                    <div className="bg-green-500 text-black text-sm lg:text-xl font-black px-3 py-1 lg:px-4 lg:py-1.5 rounded-lg lg:rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] italic">
                        +{bet.edge.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch min-h-0 lg:min-h-[220px]">
                {/* Visual Side Match Info */}
                <div className="p-6 lg:p-10 flex-1 flex flex-col justify-end relative overflow-hidden pt-20 lg:pt-10">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] grayscale pointer-events-none hidden lg:block">
                        <div className="text-9xl font-black italic tracking-tighter">DATA</div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] mb-2 lg:mb-4 flex items-center gap-2 lg:gap-3">
                            <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-white text-[9px] lg:text-[10px]">
                                {bet.sport === 'football' ? '⚽' : '🏀'} {bet.sport.toUpperCase()}
                            </span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className="truncate max-w-[150px] lg:max-w-none">{bet.league}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-3 lg:mb-4">
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                                {bet.homeTeam} <span className="text-gray-800 not-italic mx-1 lg:mx-2 text-sm lg:text-2xl">VS</span> {bet.awayTeam}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase">
                                <Clock className="w-3 h-3 text-green-500" />
                                {new Date(bet.startTime).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="w-px h-3 bg-white/10"></div>
                            <div className="text-[9px] lg:text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                Confianza: <span className="text-white">{bet.confidenceScore}/10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The "Pick" Side - Advanced Intelligence */}
                <div className="relative p-6 lg:p-10 lg:w-[460px] bg-white/[0.03] flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/5 backdrop-blur-md">

                    {!isPremium && (
                        <div className="absolute inset-0 z-30 backdrop-blur-[14px] bg-black/60 flex flex-col items-center justify-center p-6 lg:p-10 text-center">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl lg:text-3xl mb-4 shadow-xl shadow-green-500/20 rotate-3">
                                💎
                            </div>
                            <h3 className="text-white font-black mb-2 tracking-tighter text-xl lg:text-2xl italic uppercase leading-none">Análisis VIP</h3>
                            <button
                                onClick={() => window.location.href = '/pricing'}
                                className="w-full bg-white text-black text-[10px] lg:text-xs font-black px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-green-500 transition-all uppercase tracking-widest active:scale-95"
                            >
                                Desbloquear
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                        <div className="bg-black/20 rounded-xl lg:rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                            <span className="text-[8px] lg:text-[9px] text-gray-600 uppercase font-black tracking-widest block mb-1 lg:mb-2">Cuota Mercado</span>
                            <div className="text-2xl lg:text-4xl font-black text-white italic tabular-nums">
                                {bet.odds.toFixed(2)}
                            </div>
                            <div className="mt-2 h-4 lg:h-5 flex items-center">
                                {logo ? (
                                    <img src={logo} alt={bet.bookmaker} className="h-full object-contain opacity-70 grayscale hover:grayscale-0 transition-all" />
                                ) : (
                                    <span className="text-[9px] font-black text-white/30 truncate uppercase italic">{bet.bookmaker}</span>
                                )}
                            </div>
                        </div>
                        <div className="bg-green-500/5 rounded-xl lg:rounded-2xl p-4 border border-green-500/20">
                            <span className="text-[8px] lg:text-[9px] text-green-500/60 uppercase font-black tracking-widest block mb-1 lg:mb-2">Genius Prob.</span>
                            <div className="text-2xl lg:text-4xl font-black text-green-400 italic tabular-nums">
                                {bet.aiProbability}%
                            </div>
                            <div className="mt-2 text-[8px] lg:text-[9px] text-green-500/40 font-bold uppercase">Línea de Valor</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-green-500/20 transition-all">
                            <div className="flex-1">
                                <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Mercado</span>
                                <span className="text-[10px] lg:text-sm font-black text-white tracking-widest italic uppercase truncate block">{bet.market}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Recomendación</span>
                                <span className="text-sm lg:text-lg font-black text-green-500 italic tracking-tighter uppercase">{bet.selection}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-3 h-3 text-gray-600" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Análisis Sniper</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2">
                                <div className="text-[10px] text-gray-600 font-bold uppercase">Prob. Implicada</div>
                                <div className="text-[10px] text-white font-mono text-right">{bet.impliedProbability}%</div>
                                <div className="text-[10px] text-gray-600 font-bold uppercase">Discrepancia</div>
                                <div className="text-[10px] text-green-400 font-bold text-right">MAGNITUD ALTA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add missing Lucide imports
import { Clock, Target } from 'lucide-react';
