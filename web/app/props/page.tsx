"use client";

import { useState, useEffect } from 'react';
import {
    Zap, Trophy, Target, Users, Search, Filter,
    ChevronDown, ChevronRight, Activity, Clock,
    Shield, BarChart3, TrendingUp, Star, ArrowLeft,
    Globe, Flame, Layers, TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { getPlayerImage, DEFAULT_IMAGES } from '@/lib/image-utils';

const categories = [
    { id: 'basketball', label: 'NBA', icon: Activity, color: 'text-[#FF4500]' },
    { id: 'football', label: 'Fútbol', icon: Target, color: 'text-primary' },
    { id: 'nfl', label: 'NFL', icon: Star, color: 'text-blue-500' },
    { id: 'mlb', label: 'MLB', icon: Shield, color: 'text-white' },
    { id: 'hockey', label: 'NHL', icon: Zap, color: 'text-cyan-400' },
    { id: 'tennis', label: 'Tenis', icon: Trophy, color: 'text-yellow-500' },
];

const subFilters = [
    { id: 'markets', label: 'MERCADOS' },
    { id: 'picks', label: 'MEJORES PICKS' },
    { id: 'combos', label: 'COMBINADAS' },
];

export default function PropsDashboard() {
    const [search, setSearch] = useState('');
    const [selectedSport, setSelectedSport] = useState('basketball');
    const [selectedSubFilter, setSelectedSubFilter] = useState('markets');
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
    const [playerDetails, setPlayerDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (search.length > 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search/players?q=${encodeURIComponent(search)}`);
                    const data = await res.json();
                    if (data.results) {
                        setPlayers(data.results);
                    }
                } catch (error) {
                    console.error("Error searching players:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setPlayers([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch details when expanding
    const handleExpand = async (id: string) => {
        if (expandedPlayer === id) {
            setExpandedPlayer(null);
            return;
        }
        setExpandedPlayer(id);
        setPlayerDetails(null);
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/player/${id}`);
            const data = await res.json();
            setPlayerDetails(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const calculateStats = (matches: any[], statKey: string) => {
        if (!matches || matches.length === 0) return { avg: 0, trend: 'stable', history: [] };
        const values = matches
            .map(m => m.playerStats?.[statKey])
            .filter(v => typeof v === 'number');

        if (values.length === 0) return { avg: 0, trend: 'stable', history: [] };

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const trend = values[0] > values[1] ? 'up' : values[0] < values[1] ? 'down' : 'stable';
        return { avg: avg.toFixed(1), trend, history: [...values].reverse() };
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black pb-24 font-sans">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[180px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[200px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <main className="relative z-10 pt-32 px-4 md:px-12 max-w-[85rem] mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-[6.5rem] font-black italic uppercase tracking-tighter leading-tight text-white mb-2">
                        PANEL DE <span className="text-primary italic">PROPS</span> DE JUGADORES
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-3xl mx-auto leading-relaxed">
                        Análisis masivo de mercados de jugadores impulsado por Inteligencia Artificial de última
                        generación y datos en tiempo real de SportsData.
                    </p>
                </div>

                {/* Filters Terminal */}
                <div className="flex flex-col items-center gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl">
                    {/* Main Category Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-white/[0.03] rounded-[2rem] border border-white/5 backdrop-blur-xl">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedSport(cat.id);
                                    setSearch('');
                                    setPlayers([]);
                                }}
                                className={clsx(
                                    "px-10 py-4 rounded-[1.8rem] transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-3",
                                    selectedSport === cat.id
                                        ? "bg-white text-black shadow-2xl"
                                        : "hover:bg-white/5 text-gray-500"
                                )}
                            >
                                <cat.icon className={clsx("w-4 h-4", selectedSport === cat.id ? "text-black" : cat.color)} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sub Filters - Middle Bar */}
                    <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-md">
                        {subFilters.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSubFilter(sub.id)}
                                className={clsx(
                                    "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedSubFilter === sub.id
                                        ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                        : "text-gray-600 hover:text-gray-400"
                                )}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="w-full max-w-2xl relative group">
                        <input
                            type="text"
                            placeholder="BUSCAR JUGADOR O EQUIPO..."
                            className="w-full bg-black/60 border-2 border-white/5 rounded-2xl py-6 px-12 text-sm font-black italic uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:bg-black transition-all text-center placeholder:text-gray-700 shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-primary transition-colors" />
                    </div>
                </div>

                {/* Player Feed */}
                <div className="space-y-4 max-w-6xl mx-auto">
                    {players.length > 0 ? (
                        players.map((player) => (
                            <div
                                key={player.id}
                                className={clsx(
                                    "group bg-white/[0.01] border  transition-all duration-300 rounded-[2.5rem] overflow-hidden",
                                    expandedPlayer === player.id ? "border-primary/20 bg-white/[0.04]" : "border-white/5 hover:border-white/10"
                                )}
                            >
                                {/* Main Row */}
                                <div
                                    className="p-8 flex items-center justify-between cursor-pointer"
                                    onClick={() => handleExpand(player.id)}
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-2 border-white/5 p-1 overflow-hidden group-hover:border-primary/30 transition-colors">
                                                <img
                                                    src={getPlayerImage(player.id)}
                                                    onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.player }}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black border border-white/10 rounded-full flex items-center justify-center">
                                                <Activity className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none flex items-center gap-3">
                                                {player.name}
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black text-primary">
                                                    <Zap className="w-3 h-3 fill-primary" /> PRO
                                                </span>
                                            </h3>
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                <span className="text-white/80">{player.team}</span>
                                                <span className="text-gray-800">VS RIVAL</span>
                                                <span className="text-gray-800">•</span>
                                                <span className="text-gray-600 uppercase">Análisis Terminal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Mercados Disponibles</p>
                                            <p className="text-xl font-black italic text-white leading-none">
                                                1 <span className="text-primary italic">PROPS</span>
                                            </p>
                                        </div>
                                        <div className={clsx(
                                            "w-12 h-12 rounded-full bg-white/5 flex items-center justify-center transition-all",
                                            expandedPlayer === player.id ? "rotate-180 bg-primary/20 text-primary" : "text-gray-600 group-hover:text-white"
                                        )}>
                                            <ChevronDown className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Panel */}
                                {expandedPlayer === player.id && (
                                    <div className="px-8 pb-10 pt-4 animate-in slide-in-from-top-4 duration-300">
                                        {loadingDetails ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Activity className="w-8 h-8 text-primary animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {['points', 'assists', 'totalRebounds', 'threePointsMade'].map(key => {
                                                    const stats = calculateStats(playerDetails?.lastMatches, key);
                                                    const labels: any = {
                                                        points: 'PUNTOS',
                                                        assists: 'ASISTENCIAS',
                                                        totalRebounds: 'REBOTES',
                                                        threePointsMade: 'TRIPLES'
                                                    };
                                                    return (
                                                        <div key={key} className="bg-black/60 border border-white/5 rounded-[2rem] p-6 space-y-6 group/card hover:border-primary/40 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                                                        <Activity className="w-4 h-4 text-primary" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{labels[key]}</span>
                                                                </div>
                                                                <span className="text-2xl font-black italic text-white tracking-tighter">--</span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                                                                    <p className="text-[8px] font-black text-gray-600 uppercase mb-1">PROMEDIO</p>
                                                                    <p className="text-xl font-black italic text-primary">{stats.avg}</p>
                                                                </div>
                                                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center flex flex-col items-center justify-center">
                                                                    <p className="text-[8px] font-black text-gray-600 uppercase mb-1">TENDENCIA</p>
                                                                    {stats.trend === 'up' ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
                                                                </div>
                                                            </div>

                                                            {/* Sparkline Visual */}
                                                            <div className="h-10 flex items-end gap-1 px-1">
                                                                {stats.history.slice(-10).map((val: any, i: number) => {
                                                                    const numVal = Number(val) || 0;
                                                                    const avgVal = parseFloat(stats.avg as string) || 1;
                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className="flex-1 bg-white/10 rounded-t-sm transition-all group-hover/card:bg-primary/30"
                                                                            style={{ height: `${Math.min(100, (numVal / (avgVal * 2)) * 100)}%` }}
                                                                        ></div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <Link href={`/player/${selectedSport}/${player.id}`}>
                                                                <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-primary transition-all">
                                                                    <Zap className="w-4 h-4 fill-black" />
                                                                    IA ANALYZE
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                            <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-700">Explorador Pro Activo</h3>
                            <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.4em] mt-2">Busca un jugador para iniciar investigación</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Central HQ Button */}
            <div className="fixed bottom-12 right-12 z-50">
                <Link href="/" className="flex items-center gap-3 p-5 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl">
                    <ArrowLeft className="w-5 h-5" />
                    CENTRAL HQ
                </Link>
            </div>
        </div>
    );
}
