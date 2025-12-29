'use client';

import React from 'react';

interface Player {
    player: {
        name: string;
        slug: string;
        position: string;
    };
    statistics?: {
        points?: number;
        rebounds?: number;
        assists?: number;
        secondsPlayed?: number; // Cambiado de minutes a secondsPlayed
        fieldGoalsMade?: number;
        fieldGoalsAttempted?: number;
        threePointsMade?: number;
        threePointsAttempted?: number;
        freeThrowsMade?: number;
        freeThrowsAttempted?: number;
    };
    jerseyNumber?: string;
}

interface PlayerStatsTableProps {
    teamName: string;
    players: Player[];
}

export default function PlayerStatsTable({ teamName, players }: PlayerStatsTableProps) {
    // Filtrar jugadores que no han jugado (sin estadísticas o 0 segundos)
    const activePlayers = players.filter(p => p.statistics && (p.statistics.secondsPlayed || 0) > 0);

    // Ordenar por puntos (descendente) o minutos
    activePlayers.sort((a, b) => (b.statistics?.points || 0) - (a.statistics?.points || 0));

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
            <h3 className="bg-gray-800 px-4 py-3 text-white font-bold border-b border-gray-700">
                {teamName} - Estadísticas de Jugadores
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                            <th className="px-4 py-3">Jugador</th>
                            <th className="px-2 py-3 text-center">MIN</th>
                            <th className="px-2 py-3 text-center font-bold text-white">PTS</th>
                            <th className="px-2 py-3 text-center">REB</th>
                            <th className="px-2 py-3 text-center">ASI</th>
                            <th className="px-2 py-3 text-center">TC</th>
                            <th className="px-2 py-3 text-center">3P</th>
                            <th className="px-2 py-3 text-center">TL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activePlayers.map((player, index) => {
                            const minutes = Math.round((player.statistics?.secondsPlayed || 0) / 60);
                            return (
                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                                    <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                        <span className="text-gray-500 text-xs w-4">{player.jerseyNumber}</span>
                                        {player.player.name}
                                    </td>
                                    <td className="px-2 py-3 text-center">{minutes}'</td>
                                    <td className="px-2 py-3 text-center font-bold text-blue-400">{player.statistics?.points}</td>
                                    <td className="px-2 py-3 text-center">{player.statistics?.rebounds}</td>
                                    <td className="px-2 py-3 text-center">{player.statistics?.assists}</td>
                                    <td className="px-2 py-3 text-center text-xs">
                                        {player.statistics?.fieldGoalsMade}/{player.statistics?.fieldGoalsAttempted}
                                    </td>
                                    <td className="px-2 py-3 text-center text-xs">
                                        {player.statistics?.threePointsMade}/{player.statistics?.threePointsAttempted}
                                    </td>
                                    <td className="px-2 py-3 text-center text-xs">
                                        {player.statistics?.freeThrowsMade}/{player.statistics?.freeThrowsAttempted}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
