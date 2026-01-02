"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/components/ClerkSafeProvider';
import { useQuery } from '@tanstack/react-query';
import { useBankroll } from '@/hooks/useBankroll';
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
    { id: 'nba', name: 'NBA 🏀', icon: Activity },
    { id: 'football', name: 'Fútbol', icon: Trophy },
    { id: 'basketball', name: 'Basketball', icon: Activity },
    { id: 'tennis', name: 'Tenis', icon: Activity },
    { id: 'nfl', name: 'NFL', icon: Trophy },
    { id: 'baseball', name: 'Béisbol', icon: Trophy },
    { id: 'hockey', name: 'NHL/Hockey', icon: Trophy },
];

export default function ParleyOptimizer({ isOpen, onClose, sport: initialSport = 'football' }: ParleyOptimizerProps) {
    const { user } = useUser();
    const { addEntry, currentBankroll } = useBankroll();
    const [selectedRisk, setSelectedRisk] = useState<string>('safe');
    const [currentSport, setCurrentSport] = useState(initialSport);
    const [searchTerm, setSearchTerm] = useState(''); // New State for Search
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [stake, setStake] = useState<string>("100");
    const [payout, setPayout] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Matches Query (for social feed context mainly)
    const { data: matches = [], isLoading: matchesLoading } = useQuery({
        queryKey: ['optimizer-matches', currentSport],
        queryFn: async () => {
            const apiSport = currentSport === 'all' ? 'football' : (currentSport === 'nba' ? 'basketball' : currentSport);
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

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);
        try {
            // Include search term and sport in the request
            const queryParams = new URLSearchParams({
                risk: selectedRisk,
                sport: currentSport,
                q: searchTerm // Pass search term to backend
            });

            const res = await fetch(`/api/optimizer/parley?${queryParams.toString()}`);
            const data = await res.json();
            setResult(data);

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
            const parleyText = `🔥 He optimizado este Parley (${result.riskLevel}) en ${currentSport.toUpperCase()}:\n${result.picks.map((p: any) => `- ${p.match}: ${p.market} (${p.odds})`).join('\n')}\nCuota Total: ${result.odds}`;
            const res = await fetch(`/api/comments/global`, { // Share globally for now
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
    const handleSaveToBankroll = () => {
        if (!result) return;
        setIsSaving(true);
        try {
            const parleyMatchName = `COMBINADA: ${result.picks.map((p: any) => p.match.split(' vs ')[0]).join(' + ')}`;
            addEntry({
                id: Date.now(),
                date: new Date().toISOString(),
                match: parleyMatchName,
                stake: parseFloat(stake),
                odds: parseFloat(result.odds.replace('x', '')),
                type: 'W' // Win for the demo flow
            });
            alert("¡Parley registrado en tu Bankroll exitosamente! Revisa tu ROI en la sección BANKROLL.");
        } catch (err) {
            console.error("Error saving to bankroll:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const strategies = [
        {
            id: 'safe',
            title: 'PARLEY SEGURO',
            description: '2-3 picks de altísima probabilidad (>85%).',
            hitRate: '88%',
            icon: Shield,
            color: 'border-green-500/50'
        },
        {
            id: 'bold',
            title: 'PARLEY VALIENTE',
            description: 'Equilibrio perfecto. Cuotas 5.00 - 10.00.',
            hitRate: '72%',
            icon: Target,
            color: 'border-orange-500/50'
        },
        {
            id: 'bomb',
            title: 'PARLEY BOMBA',
            description: 'Alto riesgo, premio masivo. Cuotas 25.00+.',
            hitRate: '40%',
            icon: Zap,
            color: 'border-red-500/50'
        }
    ];

    // Add NBA Deep Props strategy if Basketball is selected
    if (currentSport === 'basketball' || currentSport === 'nba') {
        strategies.push({
            id: 'nba_props',
            title: 'NBA DEEP PROPS',
            description: 'Handicaps, 1st Half, Unders/Overs y Player Props.',
            hitRate: 'Special',
            icon: Dribbble,
            color: 'border-primary/50 bg-primary/5'
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#050505] border border-white/10 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] animate-in zoom-in-95 duration-500 flex flex-col md:flex-row overflow-hidden">

                {/* Left Sidebar: Sport Selector */}
                <div className="w-full md:w-64 bg-black/40 border-r border-white/5 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deporte</span>
                    </div>
                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {sportsList.map(s => (
                            <button
                                key={s.id}
                                onClick={() => { setCurrentSport(s.id); setResult(null); }}
                                className={clsx(
                                    "px-4 py-3 rounded-xl flex items-center gap-3 transition-all min-w-[120px] md:min-w-0",
                                    currentSport === s.id ? "bg-white text-black font-bold shadow-glow-sm" : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <s.icon className={clsx("w-4 h-4", currentSport === s.id ? "text-black" : "text-gray-500")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full bg-[#050505]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-black via-[#0a0a0a] to-[#050505] p-8 md:p-10 flex justify-between items-center border-b border-white/5 relative overflow-hidden shrink-0">
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                                PARLEY <span className="text-primary">OPTIMIZER</span>
                            </h2>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">IA v4.2 Engine • {currentSport.toUpperCase()}</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <input
                                type="text"
                                placeholder={`Buscar equipo o jugador en ${currentSport.toUpperCase()}... (Opcional)`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pl-12 text-white font-medium placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all relative z-10"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <Target className="w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        {/* Strategy Selector */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Selecciona Estrategia</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {strategies.map((strat) => (
                                    <div
                                        key={strat.id}
                                        onClick={() => { setSelectedRisk(strat.id); setResult(null); }}
                                        className={clsx(
                                            "p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden group",
                                            selectedRisk === strat.id ? `bg-white/5 ${strat.color} shadow-[0_0_20px_rgba(0,0,0,0.5)]` : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        {selectedRisk === strat.id && <div className="absolute top-0 right-0 p-10 bg-current opacity-10 blur-xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-primary"></div>}
                                        <strat.icon className={clsx("w-6 h-6 relative z-10", selectedRisk === strat.id ? "text-white" : "text-gray-600")} />
                                        <div className="relative z-10">
                                            <h4 className="text-xs font-black text-white uppercase italic leading-tight mb-1">{strat.title}</h4>
                                            <p className="text-[9px] text-gray-500 uppercase font-medium leading-relaxed">{strat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Result Area */}
                        <div className="space-y-6">
                            {loading && (
                                <div className="h-40 rounded-[2rem] bg-white/5 animate-pulse flex flex-col items-center justify-center gap-4">
                                    <Zap className="w-8 h-8 text-white/20 animate-bounce" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Analizando {currentSport.toUpperCase()}...</span>
                                </div>
                            )}

                            {result && (
                                <div className="animate-in slide-in-from-bottom-6 duration-500">
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
                                        {/* Result Header */}
                                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                            <div>
                                                <p className="text-[9px] font-black text-primary uppercase mb-1">Estrategia: {result.riskLevel}</p>
                                                <h3 className="text-xl font-black text-white uppercase italic">Combinada BetPlay</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-mono font-black text-primary">{result.odds}</p>
                                                <p className="text-[8px] font-black text-gray-500 uppercase">Cuota Total</p>
                                            </div>
                                        </div>

                                        {/* Picks List */}
                                        <div className="space-y-2">
                                            {result.picks.map((pick: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-primary/20 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:bg-primary group-hover:text-black transition-colors">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{pick.match}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">{pick.market}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-black text-white/60">{pick.odds}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Payout Calc */}
                                        <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between border border-primary/10">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Apuesta ($)</p>
                                                <input
                                                    type="number"
                                                    value={stake}
                                                    onChange={(e) => setStake(e.target.value)}
                                                    className="bg-transparent text-xl font-black text-white w-24 outline-none border-b border-white/10 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Ganancia</p>
                                                <p className="text-xl font-black text-primary font-mono">${payout.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                                        <button
                                            onClick={handleShare}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10 transition-all"
                                        >
                                            Compartir
                                        </button>
                                        <button
                                            onClick={handleSaveToBankroll}
                                            disabled={isSaving}
                                            className="flex-1 py-4 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl text-[10px] font-black text-purple-400 uppercase tracking-widest border border-purple-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            {isSaving ? 'Guardando...' : 'Log a Bankroll'}
                                        </button>
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-4 bg-primary hover:bg-white hover:text-black text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow"
                                        >
                                            Nueva Combinada
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!result && !loading && (
                                <button
                                    onClick={handleGenerate}
                                    className="w-full h-20 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-[1.5rem] hover:scale-[1.01] transition-all shadow-glow hover:bg-white active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12"></div>
                                    <Zap className="w-5 h-5 fill-black relative z-10" />
                                    <span className="relative z-10">Generar Parley {currentSport !== 'all' ? currentSport.toUpperCase() : ''}</span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
