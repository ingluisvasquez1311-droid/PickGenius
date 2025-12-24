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
        // Keeping it subtle for the glass effect
        return 'border border-white/5 bg-white/[0.02]';
    };

    const getTeamColorHex = () => {
        switch (teamColor) {
            case 'purple': return '#a855f7';
            case 'orange': return '#f97316';
            case 'blue': return '#3b82f6';
            case 'green': return '#22c55e';
            default: return '#a855f7';
        }
    };

    const renderStats = (player: any) => {
        const stats = player.statistics || {};
        const pColor = getTeamColorHex();

        switch (sport.toLowerCase()) {
            case 'basketball':
                // Check if we have specific stats, otherwise fallback to generic
                if (stats.points === undefined && stats.rebounds === undefined) return null;
                return (
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {stats.points !== undefined && <span>{stats.points} PTS</span>}
                        {stats.rebounds !== undefined && <span className="text-white/40">•</span>}
                        {stats.rebounds !== undefined && <span>{stats.rebounds} REB</span>}
                        {stats.assists !== undefined && <span className="text-white/40">•</span>}
                        {stats.assists !== undefined && <span>{stats.assists} AST</span>}
                    </div>
                );
            case 'football':
                return (
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {stats.goals !== undefined && stats.goals > 0 && <span>{stats.goals} Goles</span>}
                        {stats.rating !== undefined && <span>Rating {stats.rating}</span>}
                    </div>
                );
            // Add other sports as needed, simplified
            default:
                return null;
        }
    };

    return (
        <div className={`glass-card overflow-hidden`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: getTeamColorHex() }}></div>
                    <h3 className="text-white font-black text-xs uppercase tracking-widest">
                        {title.replace('TOP PLAYERS', 'JUGADORES TOP')}
                    </h3>
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase">{sport}</span>
            </div>

            {/* Players List */}
            <div className="divide-y divide-white/5">
                {topPlayers.map((player, index) => {
                    const pData = player.player || player;
                    const imageUrl = pData.id
                        ? `/api/proxy/player-image/${pData.id}`
                        : null;
                    const rating = (player.statistics?.rating || player.rating || 0).toFixed(1);
                    const isMvp = index === 0 && parseFloat(rating) >= 8.0;

                    return (
                        <div
                            key={index}
                            className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group active:scale-[0.99] duration-200"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className={`font-black text-[10px] w-4 text-center ${index === 0 ? 'text-yellow-500 text-lg -ml-1 mr-1' : 'text-white/20'}`}>
                                    {index === 0 ? '👑' : index + 1}
                                </span>

                                <div className={`relative w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors shrink-0 ${isMvp ? 'ring-2 ring-yellow-500/20' : ''}`}>
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={pData.name || 'Jugador'}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-black">
                                            {(pData.name || '?').substring(0, 1)}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-bold text-xs truncate group-hover:text-purple-400 transition-colors">
                                        {pData.name}
                                    </p>
                                    {renderStats(player)}
                                </div>
                            </div>

                            <div className={`
                                flex flex-col items-center justify-center w-10 h-8 rounded-lg border border-white/5
                                ${isMvp
                                    ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 text-yellow-500 border-yellow-500/30'
                                    : 'bg-white/5 text-white/80'}
                            `}>
                                <span className="text-[10px] font-black leading-none">{rating}</span>
                                <span className="text-[6px] uppercase opacity-50 font-bold">Rtg</span>
                            </div>
                        </div>
                    );
                })}

                {topPlayers.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <p className="text-gray-500 text-xs font-medium">Estadísticas por jugar</p>
                    </div>
                )}
            </div>

            {/* Micro-interaction Helper */}
            {topPlayers.length > 0 && <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>}
        </div>
    );
}
