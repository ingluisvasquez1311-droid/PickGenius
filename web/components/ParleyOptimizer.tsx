"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
    X, Zap, Shield, TrendingUp, BarChart3,
    ChevronRight, Target, Activity, Flame, Star,
    Globe, Trophy, User, ArrowRight, Dribbble
} from 'lucide-react';
import clsx from 'clsx';

interface ParleyOptimizerProps {
    isOpen: boolean;
    onClose: () => void;
    sport?: string;
}

const sportsList = [
    { id: 'all', name: 'Todos', icon: Globe },
    { id: 'football', name: 'Fútbol', icon: Trophy },
    { id: 'basketball', name: 'NBA/Basket', icon: Activity },
    { id: 'tennis', name: 'Tenis', icon: Activity },
    { id: 'nfl', name: 'NFL', icon: Trophy },
    { id: 'baseball', name: 'Béisbol', icon: Trophy },
    { id: 'hockey', name: 'NHL/Hockey', icon: Trophy },
];

export default function ParleyOptimizer({ isOpen, onClose, sport: initialSport = 'football' }: ParleyOptimizerProps) {
    const { user } = useUser();
    const [selectedRisk, setSelectedRisk] = useState<string>('safe');
    const [currentSport, setCurrentSport] = useState(initialSport);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { data: matches = [], isLoading: matchesLoading } = useQuery({
        queryKey: ['optimizer-matches', currentSport],
        queryFn: async () => {
            const apiSport = currentSport === 'all' ? 'football' : currentSport;
            const res = await fetch(`/api/scheduled/${apiSport}`);
            const data = await res.json();
            return (data.events || []).slice(0, 5).map((e: any) => ({
                teams: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
                league: e.tournament.name,
                id: e.id,
                odds: e.odds
            }));
        },
        enabled: isOpen,
    });
    const [showSportSwitcher, setShowSportSwitcher] = useState(false);
    const [stake, setStake] = useState<string>("100");
    const [payout, setPayout] = useState<number>(0);

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`/api/optimizer/parley?risk=${selectedRisk}&sport=${currentSport}`);
            const data = await res.json();
            setResult(data);

            // Calculate initial payout
            if (data.odds) {
                const numericOdds = parseFloat(data.odds.replace('x', '')) || 0;
                setPayout(numericOdds * parseFloat(stake || "0"));
            }
        } catch (error) {
            console.error("Error generating parley:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (result && result.odds) {
            const numericOdds = parseFloat(result.odds.replace('x', '')) || 0;
            setPayout(numericOdds * parseFloat(stake || "0"));
        }
    }, [stake, result]);

    const handleShare = async () => {
        if (!result || !user) return;
        setLoading(true);
        try {
            const parleyText = `🔥 He optimizado este Parley (${result.riskLevel}):\n${result.picks.map((p: any) => `- ${p.match}: ${p.market} (${p.odds})`).join('\n')}\nCuota Total: ${result.odds}`;

            const res = await fetch(`/api/comments/${matches[0]?.id || 'global'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: parleyText })
            });

            if (res.ok) {
                alert("¡Parley compartido en el Social Feed con éxito!");
            }
        } catch (err) {
            console.error("Error sharing parley:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const strategies = [
        {
            id: 'safe',
            title: 'PARLEY SEGURO (CONSERVADOR)',
            description: '2-3 picks de altísima probabilidad. Ideal para construir banca con bajo riesgo. Probabilidad de acierto superior al 85%.',
            hitRate: '88%',
            impact: 'BAJO RIESGO',
            tier: 'AI TIER 1',
            icon: Shield,
            color: 'border-green-500/50'
        },
        {
            id: 'bold',
            title: 'PARLEY VALIENTE (MODERADO)',
            description: '3-5 picks con excelente valor matemático. El equilibrio perfecto entre cuota y probabilidad. Cuotas buscadas de 5.00 a 10.00.',
            hitRate: '72%',
            impact: 'EQUILIBRADO',
            tier: 'AI TIER 1',
            icon: Target,
            color: 'border-orange-500/50'
        },
        {
            id: 'bomb',
            title: 'PARLEY BOMBA (ALTO MULTIPLICADOR)',
            description: '6-10 picks para los que buscan el gran premio. Selección agresiva de mercados alternativos. Cuotas de 25.00 o más.',
            hitRate: '40%',
            impact: 'ALTA VOLATILIDAD',
            tier: 'AI TIER 2',
            icon: Zap,
            color: 'border-red-500/50'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#050505] border border-white/10 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] animate-in zoom-in-95 duration-500">

                {/* Header Banner */}
                <div className="bg-gradient-to-br from-black via-[#FF5F1F] to-[#FF8C00] p-10 md:p-14 flex justify-between items-start relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 font-mono">
                            <Zap className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.5em]">AI OPTIMIZER PRO</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
                            PARLEY <span className="text-white/40">OPTIMIZER</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-4 bg-black/20 hover:bg-black/40 rounded-2xl text-white transition-all border border-white/10 relative z-10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 md:p-14 space-y-12">
                    {/* Strategy Selector UI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {strategies.map((strat) => (
                            <div
                                key={strat.id}
                                onClick={() => { setSelectedRisk(strat.id); setResult(null); }}
                                className={clsx(
                                    "p-6 rounded-[2rem] border transition-all cursor-pointer space-y-4",
                                    selectedRisk === strat.id ? `bg-white/5 ${strat.color} shadow-glow-sm` : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                                )}
                            >
                                <strat.icon className={clsx("w-8 h-8", selectedRisk === strat.id ? "text-primary" : "text-gray-700")} />
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase italic">{strat.title}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{strat.hitRate} ACIERTO</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Result and Actions */}
                    <div className="space-y-8">
                        {loading && (
                            <div className="h-40 rounded-[2rem] bg-white/5 animate-pulse flex items-center justify-center">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Analizando Probabilidades...</span>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-6 transition-all duration-700">
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
                                    <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-primary uppercase">Risk: {result.riskLevel}</p>
                                            <h4 className="text-2xl font-black text-white uppercase italic">Análisis Final</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-mono font-black text-primary">{result.odds}</p>
                                            <p className="text-[8px] font-black text-gray-500 uppercase">Cuota Total</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {result.picks.map((pick: any, idx: number) => (
                                            <div key={idx} className="flex justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20 transition-all">
                                                <span className="text-xs font-bold text-gray-400">{pick.match}</span>
                                                <span className="text-xs font-black text-white italic">{pick.market}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                        <p className="text-[10px] text-primary/80 leading-relaxed italic">"{result.expertAdvise}"</p>
                                    </div>

                                    {/* Bankroll Simulator Section */}
                                    <div className="bg-gradient-to-br from-green-950/20 to-transparent p-8 rounded-[2.5rem] border border-green-500/20 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-black text-green-500 uppercase italic">Betting Power Simulator</h4>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Calcula tu ganancia potencial</p>
                                            </div>
                                            <div className="p-3 bg-green-500/10 rounded-xl">
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Tu Apuesta ($)</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-5 flex items-center text-primary font-black">$</div>
                                                    <input
                                                        type="number"
                                                        value={stake}
                                                        onChange={(e) => setStake(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xl font-black text-white focus:border-primary outline-none transition-all group-hover/input:border-white/20"
                                                        placeholder="Monto..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Retorno Potencial</label>
                                                <div className="bg-white/5 border border-white/5 rounded-2xl py-4 px-6">
                                                    <p className="text-[9px] font-black text-primary uppercase mb-1">Ganancia Neta</p>
                                                    <p className="text-2xl font-black text-white font-mono">
                                                        ${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Compartir en Feed
                                    </button>
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                                    >
                                        RE-OPTIMIZAR
                                    </button>
                                </div>
                            </div>
                        )}

                        {!result && !loading && (
                            <button
                                onClick={handleGenerate}
                                className="w-full h-24 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] hover:scale-[1.01] transition-all shadow-glow hover:bg-white active:scale-95"
                            >
                                GENERAR PARLEY CON IA
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
