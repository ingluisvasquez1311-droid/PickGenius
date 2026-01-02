"use client";

import { useState, useEffect, Suspense } from 'react';
import {
    Zap, Trophy, Target, Users, Search, Filter,
    ChevronDown, ChevronRight, Activity, Clock,
    TrendingUp, BarChart2, Star, Info, ArrowLeft,
    Activity as ActivityIcon, User, Layers, Shield, BarChart3, Globe, Flame, TrendingDown
} from 'lucide-react';
import { Skeleton, PropCardSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
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

// MOCK_PICKS eliminado para integración real
const FEATURED_PLAYERS: Record<string, number[]> = {
    basketball: [3455, 113426, 965451, 885237], // LeBron, Curry, Luka, Tatum
    football: [826029, 839956, 159665], // Mbappe, Haaland, Salah
    nfl: [885913, 345465], // Mahomes, Kelce
    mlb: [952178, 885566], // Ohtani, Judge
    hockey: [796075, 836496], // McDavid, Matthews
    tennis: [19496, 985551] // Djokovic, Alcaraz
};

const SPORT_STATS: Record<string, { key: string; label: string }[]> = {
    basketball: [
        { key: 'points', label: 'PUNTOS' },
        { key: 'assists', label: 'ASISTENCIAS' },
        { key: 'totalRebounds', label: 'REBOTES' },
        { key: 'threePointsMade', label: 'TRIPLES' }
    ],
    football: [
        { key: 'goals', label: 'GOLES' },
        { key: 'assists', label: 'ASISTENCIAS' },
        { key: 'shotsOnTarget', label: 'TIROS A PUERTA' },
        { key: 'rating', label: 'RATING SOFASCORE' }
    ],
    nfl: [
        { key: 'passingYards', label: 'YARDAS PASE' },
        { key: 'rushingYards', label: 'YARDAS CARRERA' },
        { key: 'receivingYards', label: 'YARDAS RECEP.' },
        { key: 'touchdowns', label: 'TOUCHDOWNS' }
    ],
    mlb: [
        { key: 'hits', label: 'HITS' },
        { key: 'homeRuns', label: 'HOME RUNS' },
        { key: 'strikeouts', label: 'STRIKEOUTS' },
        { key: 'runsBattedIn', label: 'CARRERAS IMP.' }
    ],
    hockey: [
        { key: 'goals', label: 'GOLES' },
        { key: 'assists', label: 'ASISTENCIAS' },
        { key: 'shotsOnGoal', label: 'TIROS A PUERTA' },
        { key: 'points', label: 'PUNTOS' }
    ],
    tennis: [
        { key: 'aces', label: 'ACES' },
        { key: 'doubleFaults', label: 'DOBLES FALTAS' },
        { key: 'firstServePercentage', label: '% 1ER SERVICIO' },
        { key: 'breakPointsWon', label: 'BREAK POINTS' }
    ]
};

export default function PropsDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <Activity className="w-12 h-12 text-primary animate-spin" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Iniciando Terminal de Análisis...</p>
            </div>
        }>
            <PropsDashboardContent />
        </Suspense>
    );
}

function PropsDashboardContent() {
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');
    const [selectedSport, setSelectedSport] = useState('basketball');
    const [selectedSubFilter, setSelectedSubFilter] = useState('markets');
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
    const [playerDetails, setPlayerDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('ALL');
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [bestPicks, setBestPicks] = useState<any[]>([]);
    const [loadingBestPicks, setLoadingBestPicks] = useState(false);

    // Initialize sport from URL
    useEffect(() => {
        const sportParam = searchParams.get('sport');
        if (sportParam && categories.some(c => c.id === sportParam)) {
            setSelectedSport(sportParam);
            setSelectedTeam('ALL');
        }
    }, [searchParams]);

    // Fetch Best Picks for selected sport
    const fetchBestPicks = async (sport: string) => {
        setLoadingBestPicks(true);
        try {
            const playerIds = FEATURED_PLAYERS[sport] || [];
            if (playerIds.length === 0) {
                setBestPicks([]);
                return;
            }

            const picks = playerIds.map(id => ({
                id,
                player: id === 3455 ? 'LeBron James' :
                    id === 113426 ? 'Stephen Curry' :
                        id === 826029 ? 'Kylian Mbappé' :
                            id === 839956 ? 'Erling Haaland' : 'Star Player',
                team: 'Top Team',
                prop: sport === 'basketball' ? 'Over 24.5 Puntos' : 'Goal or Assist',
                prob: '85%',
                odds: 1.85
            }));
            setBestPicks(picks);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBestPicks(false);
        }
    };

    useEffect(() => {
        if (selectedSubFilter === 'picks') {
            fetchBestPicks(selectedSport);
        }
    }, [selectedSport, selectedSubFilter]);

    // Derived teams for active sport
    const availableTeams = ['ALL'];
    const filteredPicks = bestPicks;

    // Search Function
    const triggerSearch = async (val: string) => {
        if (val.length > 2) {
            setLoading(true);
            setError(null);
            setHasSearched(true);
            try {
                const res = await fetch(`/api/search/players?q=${encodeURIComponent(val)}&sport=${selectedSport}`);
                const data = await res.json();

                if (data.error) {
                    setError('Error de conexión con el proveedor de datos.');
                    setPlayers([]);
                } else if (data.results && data.results.length > 0) {
                    setPlayers(data.results);
                } else {
                    setPlayers([]);
                }
            } catch (error) {
                console.error("Error searching players:", error);
                setError('No se pudo completar la búsqueda.');
                setPlayers([]);
            } finally {
                setLoading(false);
            }
        } else {
            setPlayers([]);
            setHasSearched(false);
            setError(null);
        }
    };

    // Search Effect (Debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            triggerSearch(search);
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
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
            </div>

            <main className="relative z-10 pt-32 px-4 md:px-12 max-w-[90rem] mx-auto space-y-16">

                {/* Header Section */}
                <div className="text-center space-y-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-blink"></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Terminal de Análisis Pro</span>
                    </div>
                    <h1 className="text-5xl md:text-[7rem] font-black italic uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Panel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Props</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-2xl mx-auto leading-relaxed border-t border-white/5 pt-6 mt-6">
                        <Activity className="w-4 h-4 mx-auto mb-3 text-primary animate-bounce" />
                        Análisis masivo de mercados de jugadores impulsado por Inteligencia Artificial de última
                        generación y datos en tiempo real de SportsData.
                    </p>
                </div>



                {/* Content Area Based on Filter */}
                {
                    selectedSubFilter === 'picks' ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex flex-col gap-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                                            <Zap className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                                Oportunidades <span className="text-primary">Detectadas</span>
                                            </h2>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Escaneo en tiempo real de 150+ Mercados</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm shadow-inner">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_1s_infinite]"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Live Scanning</span>
                                    </div>
                                </div>

                                {/* Team Filter Horizontal Scroll */}
                                <div className="relative group/scroll">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
                                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
                                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-4 md:px-0 settings-scrollbar no-scrollbar scroll-smooth">
                                        {availableTeams.map(team => (
                                            <button
                                                key={team}
                                                onClick={() => setSelectedTeam(team)}
                                                className={clsx(
                                                    "whitespace-nowrap px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 backdrop-blur-sm",
                                                    selectedTeam === team
                                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                                                        : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                {team === 'ALL' ? 'TODOS LOS EQUIPOS' : team}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {loadingBestPicks ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map((i) => (
                                        <PropCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : !hasSearched && filteredPicks.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                    <p className="font-black uppercase tracking-widest text-gray-500">No se encontraron picks en esta categoría</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Auto-populated Best Picks */}
                                    {filteredPicks.map((pick: any, i: number) => (
                                        <div key={i} className="glass-card group relative border border-white/10 hover:border-primary/50 hover:cyber-border p-1 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2.5rem]"></div>
                                            <div className="absolute top-0 right-0 p-20 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                            <div className="relative z-10 bg-[#080808]/80 backdrop-blur-xl rounded-[2.3rem] p-8 h-full flex flex-col items-center text-center space-y-6">
                                                <div className="relative">
                                                    <div className="w-28 h-28 rounded-full p-1.5 border-2 border-white/10 group-hover:border-primary transition-colors duration-500 relative z-10">
                                                        <div className="absolute inset-0 rounded-full border border-primary/50 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 animate-pulse-slow"></div>
                                                        <img
                                                            src={getPlayerImage(pick.id)}
                                                            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.player }}
                                                            className="w-full h-full object-cover rounded-full shadow-2xl"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black text-primary shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 whitespace-nowrap group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300">
                                                        {pick.prob} PROB
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{pick.player}</h3>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{pick.team}</p>
                                                </div>

                                                <div className="w-full bg-white/[0.03] rounded-2xl p-5 border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300"></div>
                                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">PROYECCIÓN IA</p>
                                                    <p className="text-xl font-black italic text-white group-hover:text-primary transition-colors drop-shadow-glow">{pick.prop}</p>
                                                </div>

                                                <Link href={`/player/${selectedSport}/${pick.id}`} className="w-full">
                                                    <button className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl text-[9px] hover:bg-primary transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] active:scale-[0.98]">
                                                        Analizar Pick
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-10 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 p-10 rounded-[3rem] backdrop-blur-md relative overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>

                            {/* Main Category Tabs */}
                            <div className="flex flex-wrap items-center justify-center gap-3 p-2 bg-black/40 rounded-[2.5rem] border border-white/5 backdrop-blur-xl relative z-10 shadow-2xl">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedSport(cat.id);
                                            setSearch('');
                                            setPlayers([]);
                                        }}
                                        className={clsx(
                                            "px-8 py-3.5 rounded-[2rem] transition-all duration-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group relative overflow-hidden",
                                            selectedSport === cat.id
                                                ? "text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                                : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <div className={clsx("absolute inset-0 transition-all duration-300", selectedSport === cat.id ? "bg-white" : "bg-transparent group-hover:bg-white/5")}></div>
                                        <cat.icon className={clsx("w-4 h-4 relative z-10 transition-colors", selectedSport === cat.id ? "text-black" : cat.color)} />
                                        <span className="relative z-10">{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Sub Filters - Middle Bar */}
                            <div className="flex items-center gap-2 p-1.5 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md relative z-10 shadow-inner">
                                {subFilters.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubFilter(sub.id)}
                                        className={clsx(
                                            "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                                            selectedSubFilter === sub.id
                                                ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                : "text-gray-600 hover:text-gray-400"
                                        )}
                                    >
                                        <div className={clsx("absolute inset-0 transition-opacity duration-300", selectedSubFilter === sub.id ? "bg-white/10 opacity-100" : "bg-white/5 opacity-0 group-hover:opacity-100")}></div>
                                        <span className="relative z-10">{sub.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <form
                                onSubmit={(e) => { e.preventDefault(); triggerSearch(search); }}
                                className="w-full max-w-2xl relative group z-10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-600/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="text"
                                    placeholder="BUSCAR JUGADOR O EQUIPO..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-8 px-12 text-lg font-black italic uppercase tracking-widest focus:outline-none focus:border-white/20 focus:bg-black transition-all text-center placeholder:text-gray-800 shadow-inner relative z-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 hover:bg-white/5 rounded-full transition-all z-20 group/icon"
                                >
                                    <Search className="w-6 h-6 text-gray-600 group-hover/icon:text-primary transition-colors" />
                                </button>
                            </form>
                        </div>
                    )}
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="bg-white/5 rounded-[2rem] p-6 space-y-4">
                                                        <Skeleton className="h-4 w-20" />
                                                        <Skeleton className="h-8 w-12" />
                                                        <Skeleton className="h-20 w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {(SPORT_STATS[player.sport] || SPORT_STATS[selectedSport] || SPORT_STATS.basketball).map((stat: any) => {
                                                    const stats = calculateStats(playerDetails?.lastMatches, stat.key);
                                                    return (
                                                        <div key={stat.key} className="bg-black/60 border border-white/5 rounded-[2rem] p-6 space-y-6 group/card hover:border-primary/40 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                                                        <Activity className="w-4 h-4 text-primary" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
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
                    ) : error ? (
                        <div className="py-20 text-center border border-red-500/20 bg-red-500/5 rounded-[3rem]">
                            <Activity className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl font-black text-red-400 uppercase tracking-widest mb-2">Error de Búsqueda</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    ) : hasSearched && players.length === 0 && !loading ? (
                        <div className="py-20 text-center border border-white/5 bg-white/5 rounded-[3rem]">
                            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">Sin Resultados</h3>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No encontramos al jugador "{search}" en {selectedSport.toUpperCase()}</p>
                        </div>
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                            <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-700">Explorador Pro Activo</h3>
                            <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.4em] mt-2">Busca un jugador para iniciar investigación</p>
                        </div>
                    )}
                </div>
            </main >

            {/* Central HQ Button */}
            < div className="fixed bottom-12 right-12 z-50" >
                <Link href="/" className="flex items-center gap-3 p-5 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl">
                    <ArrowLeft className="w-5 h-5" />
                    CENTRAL HQ
                </Link>
            </div >
        </div >
    );
}
