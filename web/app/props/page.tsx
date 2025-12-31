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

const MOCK_PICKS: Record<string, any[]> = {
    basketball: [
        // Dallas Mavericks
        { player: 'Luka Doncic', team: 'Dallas Mavericks', prop: 'Over 32.5 Puntos', prob: '88%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/965451/image' },
        { player: 'Kyrie Irving', team: 'Dallas Mavericks', prop: 'Over 2.5 Triples', prob: '75%', odds: 1.95, image: 'https://api.sofascore.app/api/v1/player/136531/image' },
        // Denver Nuggets
        { player: 'Nikola Jokic', team: 'Denver Nuggets', prop: 'Triple-Double', prob: '75%', odds: 2.10, image: 'https://api.sofascore.app/api/v1/player/602055/image' },
        { player: 'Jamal Murray', team: 'Denver Nuggets', prop: 'Over 20.5 Puntos', prob: '65%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/845116/image' },
        // Lakers
        { player: 'LeBron James', team: 'LA Lakers', prop: 'Over 7.5 Rebotes', prob: '80%', odds: 1.80, image: 'https://api.sofascore.app/api/v1/player/3455/image' },
        { player: 'Anthony Davis', team: 'LA Lakers', prop: 'Double-Double', prob: '85%', odds: 1.70, image: 'https://api.sofascore.app/api/v1/player/136061/image' },
        { player: 'D\'Angelo Russell', team: 'LA Lakers', prop: 'Over 5.5 Asistencias', prob: '60%', odds: 2.05, image: 'https://api.sofascore.app/api/v1/player/826720/image' },
        // Warriors
        { player: 'Stephen Curry', team: 'Golden State Warriors', prop: 'Over 4.5 Triples', prob: '72%', odds: 2.00, image: 'https://api.sofascore.app/api/v1/player/113426/image' },
        { player: 'Draymond Green', team: 'Golden State Warriors', prop: 'Over 5.5 Asistencias', prob: '68%', odds: 1.95, image: 'https://api.sofascore.app/api/v1/player/357663/image' },
        // Celtics
        { player: 'Jayson Tatum', team: 'Boston Celtics', prop: 'Over 26.5 Puntos', prob: '78%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/885237/image' },
        { player: 'Jaylen Brown', team: 'Boston Celtics', prop: 'Over 22.5 Puntos', prob: '70%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/886362/image' },
        // Bucks
        { player: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', prop: 'Over 11.5 Rebotes', prob: '85%', odds: 1.80, image: 'https://api.sofascore.app/api/v1/player/495147/image' },
        { player: 'Damian Lillard', team: 'Milwaukee Bucks', prop: 'Over 3.5 Triples', prob: '74%', odds: 2.15, image: 'https://api.sofascore.app/api/v1/player/358054/image' },
        // Suns
        { player: 'Kevin Durant', team: 'Phoenix Suns', prop: 'Over 25.5 Puntos', prob: '82%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/39294/image' },
        { player: 'Devin Booker', team: 'Phoenix Suns', prop: 'Over 5.5 Asistencias', prob: '65%', odds: 2.05, image: 'https://api.sofascore.app/api/v1/player/836481/image' },
        // Heat
        { player: 'Jimmy Butler', team: 'Miami Heat', prop: 'Over 1.5 Robos', prob: '55%', odds: 2.40, image: 'https://api.sofascore.app/api/v1/player/136069/image' },
        { player: 'Bam Adebayo', team: 'Miami Heat', prop: 'Over 9.5 Rebotes', prob: '70%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/895311/image' },
        // Pacers
        { player: 'Tyrese Haliburton', team: 'Indiana Pacers', prop: 'Over 12.5 Asistencias', prob: '92%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/982924/image' },
        // 76ers
        { player: 'Joel Embiid', team: 'Philadelphia 76ers', prop: 'Over 30.5 Puntos', prob: '80%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/606997/image' },
        { player: 'Tyrese Maxey', team: 'Philadelphia 76ers', prop: 'Over 24.5 Puntos', prob: '72%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/991696/image' }
    ],
    football: [
        { player: 'Erling Haaland', team: 'Manchester City', prop: 'Anytime Goalscorer', prob: '65%', odds: 1.72, image: 'https://api.sofascore.app/api/v1/player/839956/image' },
        { player: 'Kylian Mbappé', team: 'Real Madrid', prop: 'Over 1.5 Shots on Target', prob: '78%', odds: 2.10, image: 'https://api.sofascore.app/api/v1/player/826029/image' },
        { player: 'Mohamed Salah', team: 'Liverpool', prop: 'Assist or Goal', prob: '70%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/159665/image' },
        { player: 'Kevin De Bruyne', team: 'Manchester City', prop: 'Over 0.5 Assists', prob: '60%', odds: 2.50, image: 'https://api.sofascore.app/api/v1/player/70996/image' }
    ],
    nfl: [
        { player: 'Tyreek Hill', team: 'Miami Dolphins', prop: 'Over 85.5 Rec Yards', prob: '82%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/824584/image' },
        { player: 'Christian McCaffrey', team: 'SF 49ers', prop: 'Anytime Touchdown', prob: '75%', odds: 1.65, image: 'https://api.sofascore.app/api/v1/player/885662/image' },
        { player: 'Patrick Mahomes', team: 'Kansas City Chiefs', prop: 'Over 2.5 Pass TDs', prob: '68%', odds: 2.20, image: 'https://api.sofascore.app/api/v1/player/885913/image' },
        { player: 'Travis Kelce', team: 'Kansas City Chiefs', prop: 'Over 6.5 Receptions', prob: '72%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/345465/image' }
    ],
    mlb: [
        { player: 'Shohei Ohtani', team: 'LA Dodgers', prop: 'Home Run', prob: '45%', odds: 3.50, image: 'https://api.sofascore.app/api/v1/player/952178/image' },
        { player: 'Aaron Judge', team: 'NY Yankees', prop: 'Over 1.5 Hits + Runs + RBIs', prob: '70%', odds: 1.95, image: 'https://api.sofascore.app/api/v1/player/885566/image' },
        { player: 'Ronald Acuña Jr.', team: 'Atlanta Braves', prop: 'Stolen Base', prob: '60%', odds: 2.80, image: 'https://api.sofascore.app/api/v1/player/886368/image' },
        { player: 'Gerrit Cole', team: 'NY Yankees', prop: 'Over 7.5 Strikeouts', prob: '65%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/348259/image' }
    ],
    hockey: [
        { player: 'Connor McDavid', team: 'Edmonton Oilers', prop: 'Over 1.5 Points', prob: '75%', odds: 1.75, image: 'https://api.sofascore.app/api/v1/player/796075/image' },
        { player: 'Auston Matthews', team: 'Toronto Maple Leafs', prop: 'Anytime Goalscorer', prob: '60%', odds: 2.10, image: 'https://api.sofascore.app/api/v1/player/836496/image' },
        { player: 'David Pastrnak', team: 'Boston Bruins', prop: 'Over 4.5 Shots on Goal', prob: '70%', odds: 1.80, image: 'https://api.sofascore.app/api/v1/player/495287/image' },
        { player: 'Cale Makar', team: 'Colorado Avalanche', prop: 'Over 0.5 Assists', prob: '68%', odds: 1.90, image: 'https://api.sofascore.app/api/v1/player/943147/image' }
    ],
    tennis: [
        { player: 'Novak Djokovic', team: 'ATP', prop: 'Under 18.5 Games', prob: '80%', odds: 1.85, image: 'https://api.sofascore.app/api/v1/player/19496/image' },
        { player: 'Carlos Alcaraz', team: 'ATP', prop: 'Win 2-0 Sets', prob: '72%', odds: 1.65, image: 'https://api.sofascore.app/api/v1/player/985551/image' },
        { player: 'Iga Swiatek', team: 'WTA', prop: 'Under 8.5 Games 1st Set', prob: '85%', odds: 1.50, image: 'https://api.sofascore.app/api/v1/player/846879/image' },
        { player: 'Jannik Sinner', team: 'ATP', prop: 'Over 6.5 aces', prob: '65%', odds: 1.95, image: 'https://api.sofascore.app/api/v1/player/912891/image' }
    ]
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

    // Initialize sport from URL
    useEffect(() => {
        const sportParam = searchParams.get('sport');
        if (sportParam && categories.some(c => c.id === sportParam)) {
            setSelectedSport(sportParam);
            setSelectedTeam('ALL');
        }
    }, [searchParams]);

    // Derived teams for active sport
    const currentPicks = MOCK_PICKS[selectedSport] || [];
    const availableTeams = ['ALL', ...Array.from(new Set(currentPicks.map(p => p.team))).sort()];

    // Filter picks
    const filteredPicks = currentPicks.filter(p => selectedTeam === 'ALL' || p.team === selectedTeam);

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



                {/* Content Area Based on Filter */}
                {
                    selectedSubFilter === 'picks' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                        Oportunidades <span className="text-primary">Detectadas</span>
                                    </h2>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Scanning</span>
                                    </div>
                                </div>

                                {/* Team Filter Horizontal Scroll */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 settings-scrollbar">
                                    {availableTeams.map(team => (
                                        <button
                                            key={team}
                                            onClick={() => setSelectedTeam(team)}
                                            className={clsx(
                                                "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                selectedTeam === team
                                                    ? "bg-white text-black border-white"
                                                    : "bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
                                            )}
                                        >
                                            {team === 'ALL' ? 'TODOS LOS EQUIPOS' : team}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-64 bg-white/5 rounded-[2rem] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Auto-populated Best Picks */}
                                    {filteredPicks.map((pick: any, i: number) => (
                                        <div key={i} className="group relative bg-[#090909] border border-white/10 hover:border-primary/50 p-6 rounded-[2.5rem] transition-all hover:shadow-[0_0_30px_rgba(16,255,80,0.15)] overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Zap className="w-32 h-32 text-primary rotate-12" />
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                                <div className="relative">
                                                    <div className="w-24 h-24 rounded-full p-1 border-2 border-primary/30 group-hover:border-primary transition-colors">
                                                        <img src={pick.image} className="w-full h-full object-cover rounded-full" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-primary">
                                                        {pick.prob}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{pick.player}</h3>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{pick.team}</p>
                                                </div>

                                                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:bg-primary/10 transition-colors">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">PROYECCIÓN IA</p>
                                                    <p className="text-lg font-black italic text-white group-hover:text-primary transition-colors">{pick.prop}</p>
                                                </div>


                                                <button className="w-full py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-primary transition-colors">
                                                    Analizar Pick
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
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
                                            <div className="flex items-center justify-center py-12">
                                                <Activity className="w-8 h-8 text-primary animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {(SPORT_STATS[selectedSport] || SPORT_STATS.basketball).map((stat: any) => {
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
