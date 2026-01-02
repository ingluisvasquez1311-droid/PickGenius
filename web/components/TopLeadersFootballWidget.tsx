"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { getPlayerImage } from '@/lib/image-utils';

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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock Data Logic
        let mockData: TopPlayer[] = [];

        if (selectedLeague.name === 'LaLiga') {
            if (selectedCategory === 'goals') {
                mockData = [
                    { player: { id: '794839', name: 'Jude Bellingham', shortName: 'Bellingham', position: 'M' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 16, statisticsRank: 1 },
                    { player: { id: '895995', name: 'Artem Dovbyk', shortName: 'Dovbyk', position: 'F' }, team: { id: '2819', name: 'Girona' }, statisticsValue: 14, statisticsRank: 2 },
                    { player: { id: '344078', name: 'Borja Mayoral', shortName: 'Mayoral', position: 'F' }, team: { id: '2859', name: 'Getafe' }, statisticsValue: 14, statisticsRank: 3 },
                    { player: { id: '254558', name: 'Álvaro Morata', shortName: 'Morata', position: 'F' }, team: { id: '2836', name: 'Atlético' }, statisticsValue: 13, statisticsRank: 4 },
                    { player: { id: '136705', name: 'Antoine Griezmann', shortName: 'Griezmann', position: 'F' }, team: { id: '2836', name: 'Atlético' }, statisticsValue: 11, statisticsRank: 5 }
                ];
            } else if (selectedCategory === 'assists') {
                mockData = [
                    { player: { id: '136154', name: 'Toni Kroos', shortName: 'Kroos', position: 'M' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 7, statisticsRank: 1 },
                    { player: { id: '826029', name: 'Vinícius Júnior', shortName: 'Vinícius', position: 'F' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 6, statisticsRank: 2 },
                    { player: { id: '961605', name: 'Nico Williams', shortName: 'Nico W.', position: 'F' }, team: { id: '2825', name: 'Athletic' }, statisticsValue: 6, statisticsRank: 3 },
                    { player: { id: '960907', name: 'Álex Baena', shortName: 'Baena', position: 'M' }, team: { id: '2819', name: 'Villarreal' }, statisticsValue: 6, statisticsRank: 4 }
                ];
            } else {
                mockData = [
                    { player: { id: '794839', name: 'Jude Bellingham', shortName: 'Bellingham', position: 'M' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 8.12, statisticsRank: 1 },
                    { player: { id: '136154', name: 'Toni Kroos', shortName: 'Kroos', position: 'M' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 7.85, statisticsRank: 2 }
                ];
            }
        } else if (selectedLeague.name === 'Premier') {
            if (selectedCategory === 'goals') {
                mockData = [
                    { player: { id: '839956', name: 'Erling Haaland', shortName: 'Haaland', position: 'F' }, team: { id: '17', name: 'Man City' }, statisticsValue: 17, statisticsRank: 1 },
                    { player: { id: '159665', name: 'Mohamed Salah', shortName: 'Salah', position: 'F' }, team: { id: '44', name: 'Liverpool' }, statisticsValue: 15, statisticsRank: 2 }
                ];
            } else {
                mockData = [
                    { player: { id: '70996', name: 'Kevin De Bruyne', shortName: 'De Bruyne', position: 'M' }, team: { id: '17', name: 'Man City' }, statisticsValue: 8, statisticsRank: 1 },
                    { player: { id: '79554', name: 'Bruno Fernandes', shortName: 'Bruno F.', position: 'M' }, team: { id: '35', name: 'Man Utd' }, statisticsValue: 7, statisticsRank: 2 }
                ];
            }
        } else {
            // UCL Fallback
            mockData = [
                { player: { id: '839956', name: 'Erling Haaland', shortName: 'Haaland', position: 'F' }, team: { id: '17', name: 'Man City' }, statisticsValue: 6, statisticsRank: 1 },
                { player: { id: '826029', name: 'Vinícius Júnior', shortName: 'Vinícius', position: 'F' }, team: { id: '2829', name: 'Real Madrid' }, statisticsValue: 5, statisticsRank: 2 }
            ];
        }

        setTopPlayers(mockData);
        setLoading(false);
    };

    return (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md relative group hover:cyber-border transition-all duration-500">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-green-600/10 via-emerald-600/5 to-transparent p-4 cursor-pointer flex items-center justify-between border-b border-white/5 relative overflow-hidden"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-1.5 bg-green-500/10 rounded-lg border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <Trophy className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-glow">Lideres</h3>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Football Stats</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 relative z-10">
                    {/* League Selector */}
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
                        {FOOTBALL_LEAGUES.map((league) => (
                            <button
                                key={league.name}
                                onClick={() => setSelectedLeague(league)}
                                className={clsx(
                                    "flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                                    selectedLeague.name === league.name
                                        ? "text-white shadow-lg bg-gradient-to-r from-green-600 to-emerald-600"
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
                        {FOOTBALL_CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;

                            return (
                                <div key={cat.id} className={clsx("rounded-xl overflow-hidden transition-all duration-500 border", isActive ? "bg-white/[0.03] border-green-500/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]" : "bg-transparent border-transparent")}>
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={clsx("w-full p-3 flex items-center justify-between transition-all duration-300", isActive ? "bg-white/5" : "hover:bg-white/5 rounded-xl")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-1.5 h-1.5 rounded-full transition-all duration-300", isActive ? "bg-green-500 shadow-[0_0_5px_var(--green-500)]" : "bg-gray-600")}></div>
                                            <span className={clsx("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", isActive ? "text-white" : "text-gray-400")}>{cat.label}</span>
                                        </div>
                                        <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isActive ? "rotate-180 text-green-500" : "text-gray-600")} />
                                    </button>

                                    {isActive && (
                                        <div className="px-2 pb-2 block animate-in slide-in-from-top-4 fade-in duration-300">
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {/* Left Column */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(0, 5).map((player, idx) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-1.5 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group/player relative overflow-hidden">
                                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-green-500/50 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                                                                <div className="w-8 h-8 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 relative">
                                                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[7px] font-black px-1 rounded-bl-sm z-10">#{idx + 1}</div>
                                                                    <img
                                                                        src={getPlayerImage(player.player.id)}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover opacity-80 group-hover/player:opacity-100 transition-opacity"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-gray-200 truncate leading-tight group-hover/player:text-white transition-colors">{player.player.shortName}</p>
                                                                    <p className="text-[8px] font-bold text-gray-600 truncate leading-tight uppercase tracking-wide group-hover/player:text-green-500 transition-colors">{player.team.name}</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 px-1">
                                                                    <p className="text-sm font-black text-white drop-shadow-md font-mono italic">{player.statisticsValue}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-1.5">
                                                        {topPlayers.slice(5, 10).map((player, idx) => (
                                                            <div key={player.player.id} className="flex items-center gap-2 p-1.5 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group/player relative overflow-hidden">
                                                                <div className="w-8 h-8 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 relative">
                                                                    <div className="absolute top-0 right-0 bg-white/10 text-gray-300 text-[7px] font-black px-1 rounded-bl-sm z-10">#{idx + 6}</div>
                                                                    <img
                                                                        src={getPlayerImage(player.player.id)}
                                                                        alt={player.player.name}
                                                                        className="w-full h-full object-cover opacity-80 group-hover/player:opacity-100 transition-opacity"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-gray-200 truncate leading-tight group-hover/player:text-white transition-colors">{player.player.shortName}</p>
                                                                    <p className="text-[8px] font-bold text-gray-600 truncate leading-tight uppercase tracking-wide group-hover/player:text-green-500 transition-colors">{player.team.name}</p>
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
