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
                                                                        src={getPlayerImage(player.player.id)}
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
                                                                        src={getPlayerImage(player.player.id)}
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
