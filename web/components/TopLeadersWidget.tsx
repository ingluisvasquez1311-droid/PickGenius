"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface TopPlayer {
    player: {
        id: string;
        name: string;
        shortName: string;
        position: string;
    };
    team: {
        id: string;
        name: string;
    };
    statisticsValue: number;
    statisticsRank: number;
}

interface League {
    name: string;
    tournamentId: string;
    seasonId: string;
}

const LEAGUES: League[] = [
    { name: 'NBA', tournamentId: '132', seasonId: '58766' },
    { name: 'Euroleague', tournamentId: '7', seasonId: '64647' },
    { name: 'FIBA', tournamentId: '1185', seasonId: '55813' }
];

const CATEGORIES = [
    { id: 'points', label: 'Points' },
    { id: 'rebounds', label: 'Rebounds' },
    { id: 'assists', label: 'Assists' }
];

export default function TopLeadersWidget() {
    const [selectedLeague, setSelectedLeague] = useState<League>(LEAGUES[0]);
    const [selectedCategory, setSelectedCategory] = useState('points');
    const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        fetchTopPlayers();
    }, [selectedLeague, selectedCategory]);

    const fetchTopPlayers = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/top-players?tournamentId=${selectedLeague.tournamentId}&seasonId=${selectedLeague.seasonId}&category=${selectedCategory}`
            );
            const data = await res.json();
            setTopPlayers(data.topPlayers || []);
        } catch (error) {
            console.error("Error fetching top players:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md relative group hover:cyber-border transition-all duration-500">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-primary/10 via-white/5 to-transparent p-4 cursor-pointer flex items-center justify-between border-b border-white/5 relative overflow-hidden"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-1.5 bg-primary/20 rounded-lg border border-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                        <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-glow">Lideres</h3>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Top Players</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 relative z-10">
                    {/* League Selector */}
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
                        {LEAGUES.map((league) => (
                            <button
                                key={league.name}
                                onClick={() => setSelectedLeague(league)}
                                className={clsx(
                                    "flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                                    selectedLeague.name === league.name
                                        ? "text-black shadow-lg bg-gradient-to-r from-primary to-primary/80"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <span className="relative z-10">{league.name}</span>
                                {selectedLeague.name === league.name && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Category Accordion */}
                    <div className="space-y-3">
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;

                            return (
                                <div key={cat.id} className={clsx("rounded-xl overflow-hidden transition-all duration-500 border", isActive ? "bg-white/[0.03] border-primary/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]" : "bg-transparent border-transparent")}>
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={clsx("w-full p-3 flex items-center justify-between transition-all duration-300", isActive ? "bg-white/5" : "hover:bg-white/5 rounded-xl")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-1.5 h-1.5 rounded-full transition-all duration-300", isActive ? "bg-primary shadow-[0_0_5px_var(--primary)]" : "bg-gray-600")}></div>
                                            <span className={clsx("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", isActive ? "text-white" : "text-gray-400")}>{cat.label}</span>
                                        </div>
                                        <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isActive ? "rotate-180 text-primary" : "text-gray-600")} />
                                    </button>

                                    {isActive && (
                                        <div className="px-2 pb-2 block animate-in slide-in-from-top-4 fade-in duration-300">
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_var(--primary)]"></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {/* Left Column - Top 5 */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(0, 5).map((player, idx) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-1.5 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group/player relative overflow-hidden">
                                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                                                                <div className="w-8 h-8 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 relative">
                                                                    <div className="absolute top-0 right-0 bg-primary text-black text-[7px] font-black px-1 rounded-bl-sm z-10">#{idx + 1}</div>
                                                                    <img
                                                                        src={`https://wsrv.nl/?url=https://api.sofascore.app/api/v1/player/${player.player.id}/image&w=40&h=40&fit=cover&noproxy=1`}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover opacity-80 group-hover/player:opacity-100 transition-opacity"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-gray-200 truncate leading-tight group-hover/player:text-white transition-colors">{player.player.shortName}</p>
                                                                    <p className="text-[8px] font-bold text-gray-600 truncate leading-tight uppercase tracking-wide group-hover/player:text-primary transition-colors">{player.team.name}</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 px-1">
                                                                    <p className="text-sm font-black text-white drop-shadow-md font-mono italic">{player.statisticsValue}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Right Column - Next 5 */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(5, 10).map((player, idx) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-1.5 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group/player relative overflow-hidden">
                                                                <div className="w-8 h-8 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 relative">
                                                                    <div className="absolute top-0 right-0 bg-white/10 text-gray-300 text-[7px] font-black px-1 rounded-bl-sm z-10">#{idx + 6}</div>
                                                                    <img
                                                                        src={`https://wsrv.nl/?url=https://api.sofascore.app/api/v1/player/${player.player.id}/image&w=40&h=40&fit=cover&noproxy=1`}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover opacity-80 group-hover/player:opacity-100 transition-opacity"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-gray-200 truncate leading-tight group-hover/player:text-white transition-colors">{player.player.shortName}</p>
                                                                    <p className="text-[8px] font-bold text-gray-600 truncate leading-tight uppercase tracking-wide group-hover/player:text-primary transition-colors">{player.team.name}</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 px-1">
                                                                    <p className="text-sm font-black text-white drop-shadow-md font-mono italic">{player.statisticsValue}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
