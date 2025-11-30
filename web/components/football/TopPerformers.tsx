'use client';

import React from 'react';

interface TopPerformer {
    player: {
        name: string;
        id: number;
    };
    team: {
        name: string;
        shortName?: string;
    };
    statistics: {
        goals?: number;
        assists?: number;
        rating?: number;
    };
}

interface TopPerformersProps {
    topScorers?: TopPerformer[];
    topAssists?: TopPerformer[];
    isLive?: boolean;
}

export default function TopPerformers({ topScorers = [], topAssists = [], isLive = false }: TopPerformersProps) {
    if (topScorers.length === 0 && topAssists.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 mt-4">
            <h3 className="bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-3 text-white font-bold border-b border-gray-700 flex items-center gap-2">
                <span>⭐</span>
                {isLive ? 'Mejores del Partido' : 'Mejores de la Jornada'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {/* Top Scorers */}
                {topScorers.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <span>⚽</span>
                            Goleadores
                        </h4>
                        <div className="space-y-2">
                            {topScorers.slice(0, 5).map((performer, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-600 text-white' :
                                                        'bg-gray-700 text-gray-300'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">
                                                {performer.player.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {performer.team.shortName || performer.team.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {performer.statistics.rating && (
                                            <span className="text-xs text-blue-400 font-medium">
                                                {performer.statistics.rating.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-lg font-bold text-green-400">
                                            {performer.statistics.goals}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Assists */}
                {topAssists.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <span>🎯</span>
                            Asistencias
                        </h4>
                        <div className="space-y-2">
                            {topAssists.slice(0, 5).map((performer, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-600 text-white' :
                                                        'bg-gray-700 text-gray-300'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">
                                                {performer.player.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {performer.team.shortName || performer.team.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {performer.statistics.rating && (
                                            <span className="text-xs text-blue-400 font-medium">
                                                {performer.statistics.rating.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-lg font-bold text-purple-400">
                                            {performer.statistics.assists}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
