'use client';

import React from 'react';
import Image from 'next/image';

interface TopPlayer {
    name: string;
    position: string;
    rating: number;
    id?: number;
    statistics?: any; // Full stats object
}

interface TopPlayersCardProps {
    title: string;
    players: any[];
    sport: string;
    teamColor?: 'purple' | 'orange' | 'blue' | 'green';
    onPlayerClick?: (player: any) => void;
}

export default function TopPlayersCard({ title, players, sport, teamColor = 'purple', onPlayerClick }: TopPlayersCardProps) {
    // Sort by rating and take top 5
    const topPlayers = [...players]
        .sort((a, b) => (b.statistics?.rating || b.rating || 0) - (a.statistics?.rating || a.rating || 0))
        .slice(0, 5);

    const getColorClasses = () => {
        switch (teamColor) {
            case 'purple': return 'border-purple-500 bg-purple-500/10';
            case 'orange': return 'border-orange-500 bg-orange-500/10';
            case 'blue': return 'border-blue-500 bg-blue-500/10';
            case 'green': return 'border-green-500 bg-green-500/10';
            default: return 'border-purple-500 bg-purple-500/10';
        }
    };

    const getBorderColor = () => {
        switch (teamColor) {
            case 'purple': return 'border-t-purple-500';
            case 'orange': return 'border-t-orange-500';
            case 'blue': return 'border-t-blue-500';
            case 'green': return 'border-t-green-500';
            default: return 'border-t-purple-500';
        }
    };

    const renderStats = (player: any) => {
        const stats = player.statistics || {};

        switch (sport.toLowerCase()) {
            case 'basketball':
                return (
                    <>
                        {stats.points !== undefined && <span>{stats.points} PTS</span>}
                        {stats.rebounds !== undefined && <span>{stats.rebounds} REB</span>}
                        {stats.assists !== undefined && <span>{stats.assists} AST</span>}
                    </>
                );
            case 'football':
                return (
                    <>
                        {stats.goals !== undefined && stats.goals > 0 && <span>{stats.goals} G</span>}
                        {stats.goalAssist !== undefined && stats.goalAssist > 0 && <span>{stats.goalAssist} A</span>}
                        {stats.totalShots !== undefined && <span>{stats.totalShots} SH</span>}
                    </>
                );
            case 'baseball':
                return (
                    <>
                        {stats.hits !== undefined && <span>{stats.hits} H</span>}
                        {stats.runsBattedIn !== undefined && <span>{stats.runsBattedIn} RBI</span>}
                        {stats.homeRuns !== undefined && <span>{stats.homeRuns} HR</span>}
                    </>
                );
            case 'nhl':
                return (
                    <>
                        {stats.goals !== undefined && <span>{stats.goals} G</span>}
                        {stats.assists !== undefined && <span>{stats.assists} A</span>}
                        {stats.shots !== undefined && <span>{stats.shots} S</span>}
                    </>
                );
            case 'tennis':
                return (
                    <>
                        {stats.aces !== undefined && <span>{stats.aces} AC</span>}
                        {stats.doubleFaults !== undefined && <span>{stats.doubleFaults} DF</span>}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border ${getColorClasses()} overflow-hidden`}>
            {/* Header */}
            <div className={`border-t-2 ${getBorderColor()} px-4 py-3`}>
                <h3 className="text-white font-bold text-sm uppercase tracking-wide flex justify-between items-center">
                    {title}
                    <span className="text-[10px] opacity-40 font-normal">{sport.toUpperCase()}</span>
                </h3>
            </div>

            {/* Players List */}
            <div className="divide-y divide-white/5">
                {topPlayers.map((player, index) => {
                    const pData = player.player || player;
                    const imageUrl = pData.id
                        ? `https://images.weserv.nl/?url=${encodeURIComponent(`https://api.sofascore.app/api/v1/player/${pData.id}/image`)}`
                        : null;

                    return (
                        <div
                            key={index}
                            className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-gray-500 font-bold text-xs w-3">{index + 1}</span>

                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-white/20 transition-colors shrink-0">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={pData.name || 'Player'}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-xs font-bold">
                                            {(pData.name || '?').substring(0, 1)}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-semibold text-sm truncate group-hover:text-white transition-colors">
                                        {pData.name}
                                    </p>
                                    <p className="text-gray-500 text-[10px] uppercase">
                                        {player.position || pData.position || 'Player'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 hidden sm:flex">
                                    {renderStats(player)}
                                </div>

                                <div className={`
                                    ${index === 0 ? 'bg-white text-black' : 'bg-white/10 text-white'}
                                    font-bold text-xs px-2 py-1 rounded min-w-[2.5rem] text-center
                                `}>
                                    {(player.statistics?.rating || player.rating || 0).toFixed(1)}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {topPlayers.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-xs italic">
                        Estadísticas no disponibles aún
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-black/20 text-center flex justify-between items-center">
                <p className="text-gray-600 text-[10px]">Análisis en vivo</p>
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-gray-600 text-[10px]">Real-time</p>
                </div>
            </div>
        </div>
    );
}
