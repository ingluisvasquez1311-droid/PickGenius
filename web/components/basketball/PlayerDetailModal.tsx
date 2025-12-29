'use client';

import React from 'react';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

interface PlayerDetailModalProps {
    player: any;
    isOpen: boolean;
    onClose: () => void;
    teamColor?: string;
}

export default function PlayerDetailModal({ player, isOpen, onClose, teamColor = 'purple' }: PlayerDetailModalProps) {
    if (!isOpen || !player) return null;

    // Handle both flat structure (from TopPlayersCard) and nested (raw API)
    const pId = player.id || player.player?.id;
    const pName = player.name || player.player?.name;
    const pPos = player.position || player.player?.position;
    const pCountry = player.country?.name || player.player?.country?.name;
    const pRating = player.rating || player.player?.rating;

    const imageUrl = pId
        ? `${API_URL}/api/proxy/player-image/${pId}`
        : null;

    const borderColor = teamColor === 'orange' ? 'border-orange-500' : 'border-purple-500';
    const bgColor = teamColor === 'orange' ? 'bg-orange-500/20' : 'bg-purple-500/20';
    const textColor = teamColor === 'orange' ? 'text-orange-400' : 'text-purple-400';

    // Normalize stats object
    const stats = player.statistics || player;

    // Safely extract values with fallbacks
    const points = stats.points ?? stats.pts ?? 0;
    const rebounds = stats.rebounds ?? stats.reb ?? 0;
    const assists = stats.assists ?? stats.ast ?? 0;
    const rating = player.rating || player.player?.rating || stats.rating || '-';
    const minutes = stats.minutesPlayed ?? stats.min ?? '-';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Header / Banner */}
                <div className={`h-24 ${bgColor} relative flex justify-end p-4`}>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10"
                    >
                        ✕
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
                </div>

                {/* Content */}
                <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
                    {/* Player Image */}
                    <div className={`w-24 h-24 rounded-full border-4 ${borderColor} bg-gray-800 shadow-xl overflow-hidden mb-4 relative`}>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={pName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                                {pName?.substring(0, 1)}
                            </div>
                        )}
                    </div>

                    {/* Name & Position */}
                    <h2 className="text-2xl font-black text-white text-center mb-1">{pName}</h2>
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gray-800 border border-gray-700 ${textColor}`}>
                            {pPos}
                        </span>
                        {pCountry && (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                🌍 {pCountry}
                            </span>
                        )}
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-6">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">PTS</div>
                            <div className="text-2xl font-black text-white">{points}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">REB</div>
                            <div className="text-2xl font-black text-white">{rebounds}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">AST</div>
                            <div className="text-2xl font-black text-white">{assists}</div>
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="w-full bg-gray-950/50 rounded-lg p-4 border border-gray-800">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="flex justify-between border-b border-gray-800 pb-2 mr-2">
                                <span className="text-gray-400 text-sm">Minutos</span>
                                <span className="text-white font-mono">{minutes}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2 ml-2">
                                <span className="text-gray-400 text-sm">Rating</span>
                                <span className={`font-bold ${parseFloat(rating) >= 7 ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {rating}
                                </span>
                            </div>

                            {/* Extra stats if available */}
                            {stats.steals !== undefined && (
                                <div className="flex justify-between mr-2">
                                    <span className="text-gray-400 text-sm">Robos</span>
                                    <span className="text-white font-mono">{stats.steals}</span>
                                </div>
                            )}
                            {stats.blocks !== undefined && (
                                <div className="flex justify-between ml-2">
                                    <span className="text-gray-400 text-sm">Bloqueos</span>
                                    <span className="text-white font-mono">{stats.blocks}</span>
                                </div>
                            )}
                            {stats.turnovers !== undefined && (
                                <div className="flex justify-between mr-2 col-span-2 pt-2 border-t border-gray-800 mt-2">
                                    <span className="text-gray-400 text-sm">Pérdidas</span>
                                    <span className="text-white font-mono">{stats.turnovers}</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
