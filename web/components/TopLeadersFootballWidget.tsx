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

const FOOTBALL_LEAGUES: League[] = [
    { name: 'LaLiga', tournamentId: '8', seasonId: '61627' },
    { name: 'Premier', tournamentId: '17', seasonId: '61627' },
    { name: 'UCL', tournamentId: '7', seasonId: '64640' }
];

const FOOTBALL_CATEGORIES = [
    { id: 'goals', label: 'Goals' },
    { id: 'assists', label: 'Assists' },
    { id: 'rating', label: 'Rating' }
];

export default function TopLeadersFootballWidget() {
    const [selectedLeague, setSelectedLeague] = useState<League>(FOOTBALL_LEAGUES[0]);
    const [selectedCategory, setSelectedCategory] = useState('goals');
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
        <div className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 p-4 cursor-pointer flex items-center justify-between border-b border-white/5"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Top players</h3>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* League Selector */}
                    <div className="flex gap-2">
                        {FOOTBALL_LEAGUES.map((league) => (
                            <button
                                key={league.name}
                                onClick={() => setSelectedLeague(league)}
                                className={clsx(
                                    "flex-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                    selectedLeague.name === league.name
                                        ? "bg-green-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                {league.name}
                            </button>
                        ))}
                    </div>

                    {/* Category Accordion */}
                    <div className="space-y-2">
                        {FOOTBALL_CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;

                            return (
                                <div key={cat.id} className="bg-black/30 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{cat.label}</span>
                                        <ChevronDown className={clsx("w-4 h-4 transition-transform", isActive && "rotate-180")} />
                                    </button>

                                    {isActive && (
                                        <div className="px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                                            {loading ? (
                                                <div className="text-center py-6">
                                                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Left Column */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(0, 5).map((player) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition-colors">
                                                                <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={`https://wsrv.nl/?url=https://api.sofascore.app/api/v1/player/${player.player.id}/image&w=40&h=40&fit=cover&noproxy=1`}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold text-white truncate leading-tight">{player.player.shortName}</p>
                                                                    <p className="text-[9px] text-gray-500 truncate leading-tight">{player.team.name}</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-sm font-black text-green-500">{player.statisticsValue}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(5, 10).map((player) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition-colors">
                                                                <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={`https://wsrv.nl/?url=https://api.sofascore.app/api/v1/player/${player.player.id}/image&w=40&h=40&fit=cover&noproxy=1`}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold text-white truncate leading-tight">{player.player.shortName}</p>
                                                                    <p className="text-[9px] text-gray-500 truncate leading-tight">{player.team.name}</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-sm font-black text-green-500">{player.statisticsValue}</p>
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
