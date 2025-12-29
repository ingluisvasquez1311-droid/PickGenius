'use client';

import React from 'react';

interface StandingsRow {
    team: {
        name: string;
        shortName?: string;
        id: number;
    };
    position: number;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    scoresFor: number;
    scoresAgainst: number;
    points: number;
    id: number;
}

interface StandingsTableProps {
    standings: StandingsRow[];
    currentHomeTeamId?: number;
    currentAwayTeamId?: number;
}

export default function StandingsTable({ standings, currentHomeTeamId, currentAwayTeamId }: StandingsTableProps) {
    const getRowColor = (teamId: number) => {
        if (teamId === currentHomeTeamId) return 'bg-blue-500/20 border-l-4 border-blue-500';
        if (teamId === currentAwayTeamId) return 'bg-red-500/20 border-l-4 border-red-500';
        return '';
    };

    const getPositionColor = (position: number) => {
        if (position <= 4) return 'text-green-400'; // Champions League
        if (position <= 6) return 'text-blue-400'; // Europa League
        if (position >= standings.length - 2) return 'text-red-400'; // Relegation
        return 'text-gray-400';
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <h3 className="bg-gray-800 px-4 py-3 text-white font-bold border-b border-gray-700 flex items-center gap-2">
                <span>🏆</span>
                Clasificación
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                        <tr>
                            <th className="px-3 py-2 text-center">#</th>
                            <th className="px-3 py-2">Equipo</th>
                            <th className="px-2 py-2 text-center">PJ</th>
                            <th className="px-2 py-2 text-center">G</th>
                            <th className="px-2 py-2 text-center">E</th>
                            <th className="px-2 py-2 text-center">P</th>
                            <th className="px-2 py-2 text-center">GF</th>
                            <th className="px-2 py-2 text-center">GC</th>
                            <th className="px-2 py-2 text-center">DG</th>
                            <th className="px-2 py-2 text-center font-bold text-white">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row, index) => {
                            const goalDiff = row.scoresFor - row.scoresAgainst;
                            const isCurrentTeam = row.team.id === currentHomeTeamId || row.team.id === currentAwayTeamId;

                            return (
                                <tr
                                    key={index}
                                    className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${getRowColor(row.team.id)}`}
                                >
                                    <td className={`px-3 py-2 text-center font-bold ${getPositionColor(row.position)}`}>
                                        {row.position}
                                    </td>
                                    <td className={`px-3 py-2 ${isCurrentTeam ? 'font-bold text-white' : 'text-gray-300'}`}>
                                        {row.team.name}
                                    </td>
                                    <td className="px-2 py-2 text-center text-gray-400">{row.matches}</td>
                                    <td className="px-2 py-2 text-center text-green-400">{row.wins}</td>
                                    <td className="px-2 py-2 text-center text-gray-400">{row.draws}</td>
                                    <td className="px-2 py-2 text-center text-red-400">{row.losses}</td>
                                    <td className="px-2 py-2 text-center">{row.scoresFor}</td>
                                    <td className="px-2 py-2 text-center">{row.scoresAgainst}</td>
                                    <td className={`px-2 py-2 text-center font-medium ${goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                                    </td>
                                    <td className="px-2 py-2 text-center font-bold text-white">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Footer - Zone Legend */}
            {/* Dynamic Footer - Zone Legend */}
            <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Zonas de Clasificación</h4>
                </div>
                <div className="flex justify-between items-start text-xs">
                    {/* Left Side - European Spots */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded"></div>
                            <span className="text-gray-400">Champions League (1-4)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded"></div>
                            <span className="text-gray-400">Europa League (5-6)</span>
                        </div>
                    </div>

                    {/* Right Side - Relegation */}
                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded"></div>
                            <span className="text-gray-400">Descenso ({standings.length - 2}-{standings.length})</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
