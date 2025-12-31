"use client";

import { useState, useEffect } from 'react';
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
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>('correlation');
    const [currentSport, setCurrentSport] = useState(initialSport);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [showSportSwitcher, setShowSportSwitcher] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const apiSport = currentSport === 'all' ? 'football' : currentSport;
            fetch(`/api/scheduled/${apiSport}`)
                .then(res => res.json())
                .then(data => {
                    const topMatches = (data.events || []).slice(0, 5).map((e: any) => ({
                        teams: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
                        league: e.tournament.name,
                        id: e.id,
                        odds: e.odds
                    }));
                    setMatches(topMatches);
                })
                .catch(err => console.error("Error fetching matches for optimizer:", err));
        }
    }, [isOpen, currentSport]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/optimizer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategy: selectedStrategy,
                    sport: currentSport,
                    matches: matches,
                    props: []
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Error generating parley:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const strategies = [
        {
            id: 'correlation',
            title: 'CORRELACIÓN DE PROPS (ELITE)',
            description: 'Nuestro algoritmo detecta cuando el mercado de un jugador estrella (Puntos, Goles, Hits) está infravalorado respecto a la victoria de su equipo. Maximiza el multiplicador con riesgo controlado.',
            hitRate: '78%',
            impact: 'ALTO',
            tier: 'AI TIER 1',
            icon: Target,
            color: 'border-orange-500/50'
        },
        {
            id: 'hedge',
            title: 'HEDGE DE VOLATILIDAD',
            description: 'Estrategia para parleys de 3+ piernas. Combinamos apuestas de alta probabilidad con un mercado de valor. La IA ajusta el peso de cada selección para garantizar equilibrio.',
            hitRate: '72%',
            impact: 'MEDIO-ALTO',
            tier: 'AI TIER 1',
            icon: Shield,
            color: 'border-blue-500/20'
        },
        {
            id: 'streaks',
            title: 'DETECCIÓN DE RACHAS (STREAK-RIDER)',
            description: 'Encuentra jugadores o equipos que han superado sus líneas de forma consecutiva. El sistema optimiza el parley seleccionando solo rachas con momentum ascendente en todos los deportes.',
            hitRate: '81%',
            impact: 'EXTREMO',
            tier: 'AI TIER 1',
            icon: TrendingUp,
            color: 'border-green-500/20'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#050505] border border-white/10 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] animate-in zoom-in-95 duration-500">

                {/* Header: Gradient Banner */}
                <div className="bg-gradient-to-br from-[#E6551E] via-[#8B5CF6] to-[#D946EF] p-10 md:p-14 flex justify-between items-start relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.5em] font-mono">Premium AI Engine v4.0</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
                            PARLEY <span className="text-white/40">OPTIMIZER</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 bg-black/20 hover:bg-black/40 rounded-2xl text-white transition-all border border-white/10 relative z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 md:p-14 space-y-12">

                    {/* Sport Switcher & Strategy Label */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                        <div className="space-y-2">
                            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest pl-1">
                                Escenario de Análisis
                            </p>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                {strategies.find(s => s.id === selectedStrategy)?.title}
                            </h3>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowSportSwitcher(!showSportSwitcher)}
                                className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                            >
                                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary transition-all">
                                    <Globe className="w-4 h-4 text-primary group-hover:text-black" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Deporte Activo</span>
                                    <span className="block text-xs font-black text-white uppercase">{sportsList.find(s => s.id === currentSport)?.name}</span>
                                </div>
                                <ChevronRight className={clsx("w-4 h-4 text-gray-600 transition-transform", showSportSwitcher && "rotate-90")} />
                            </button>

                            {/* Dropdown Menu */}
                            {showSportSwitcher && (
                                <div className="absolute right-0 top-full mt-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-3xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-4">Seleccionar Deporte</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {sportsList.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    setCurrentSport(s.id);
                                                    setShowSportSwitcher(false);
                                                    setResult(null);
                                                }}
                                                className={clsx(
                                                    "flex items-center gap-4 p-3 rounded-2xl transition-all text-left",
                                                    currentSport === s.id ? "bg-primary/10 border border-primary/20 text-primary" : "hover:bg-white/5 text-gray-400 hover:text-white"
                                                )}
                                            >
                                                <s.icon className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-tight">{s.name}</span>
                                                {currentSport === s.id && <Zap className="w-3 h-3 ml-auto text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Strategies List */}
                    <div className="grid grid-cols-1 gap-6">
                        {strategies.map((strat) => (
                            <div
                                key={strat.id}
                                onClick={() => setSelectedStrategy(strat.id)}
                                className={clsx(
                                    "group relative p-8 rounded-[3rem] border transition-all cursor-pointer flex flex-col md:flex-row gap-8 items-center overflow-hidden",
                                    selectedStrategy === strat.id
                                        ? `bg-white/[0.04] ${strat.color} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]`
                                        : "bg-white/[0.01] border-white/5 hover:border-white/10"
                                )}
                            >
                                {/* Active Indicator Bar */}
                                {selectedStrategy === strat.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_20px_rgba(139,92,246,0.8)]"></div>
                                )}

                                {/* Left Icon */}
                                <div className={clsx(
                                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shrink-0",
                                    selectedStrategy === strat.id
                                        ? "bg-primary text-black scale-110 shadow-glow"
                                        : "bg-white/5 text-gray-700 group-hover:bg-white/10 group-hover:text-white"
                                )}>
                                    <strat.icon className="w-8 h-8" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-white">{strat.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hit Rate</span>
                                            <span className={clsx(
                                                "text-sm font-black italic px-4 py-1.5 rounded-xl border",
                                                selectedStrategy === strat.id ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/5 text-gray-500"
                                            )}>
                                                {strat.hitRate}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-2xl transition-colors">
                                        {strat.description}
                                    </p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                            <Flame className="w-3 h-3 text-orange-500" />
                                            Impacto: <span className="text-white">{strat.impact}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            {strat.tier}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-8 flex flex-col items-center gap-6">
                        {loading ? (
                            <div className="w-full h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                <div className="flex items-center gap-4 z-10">
                                    <Activity className="w-6 h-6 text-primary animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Motor IA en Proceso Decisivo...</span>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="w-full space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                                <div className="p-10 bg-gradient-to-br from-primary/10 via-black to-black border border-primary/20 rounded-[3.5rem] space-y-10 relative overflow-hidden">
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="w-20 h-20 bg-primary/10 blur-3xl rounded-full"></div>
                                    </div>

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Parley Generado</p>
                                            <h4 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">{result.title}</h4>
                                        </div>
                                        <div className="text-right bg-white/5 p-4 rounded-3xl border border-white/10 px-8">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">CUOTA TOTAL</p>
                                            <p className="text-4xl font-black text-primary font-mono">{result.odds}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {result.legs?.map((leg: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:bg-primary group-hover:text-black transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leg.event}</p>
                                                        <p className="text-lg font-black text-white italic">{leg.selection}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="hidden md:block text-right">
                                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Probabilidad</p>
                                                        <p className="text-xs font-black text-white italic">Muy Alta</p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <div className="flex items-start gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                            <div className="p-3 bg-primary text-black rounded-2xl shrink-0">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Veredicto PickGenius</p>
                                                <p className="text-sm font-medium text-gray-300 leading-relaxed italic pr-4">
                                                    "{result.aiVerdict}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        RE-OPTIMIZAR ESCENARIO
                                    </button>
                                    <button className="flex-[2] py-6 bg-primary text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:shadow-[0_20px_40px_-5px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                        COPIAR A BETPLAY
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                className="w-full py-8 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-black uppercase tracking-[0.4em] text-xs rounded-[2.5rem] hover:shadow-[0_30px_70px_-15px_rgba(139,92,246,0.8)] hover:scale-[1.01] transition-all flex items-center justify-center gap-4 active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                                GENERAR PARLEY OPTIMIZADO CON IA
                                <Zap className="w-5 h-5 animate-bounce group-hover:animate-pulse" />
                            </button>
                        )}
                        {!result && !loading && (
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] text-center max-w-lg">
                                La IA procesará correlaciones tácticas y rachas en milisegundos para <span className="text-white italic">{sportsList.find(s => s.id === currentSport)?.name}</span>.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
