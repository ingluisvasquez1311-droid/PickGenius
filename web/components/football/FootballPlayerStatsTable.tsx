'use client';

import React from 'react';

interface Player {
    player: {
        name: string;
        slug: string;
        position: string;
        jerseyNumber?: string;
    };
    shirtNumber?: number;
    position?: string;
    substitute?: boolean;
    statistics?: {
        minutesPlayed?: number;
        goals?: number;
        assists?: number;
        rating?: number;
        totalPasses?: number;
        accuratePasses?: number;
        interceptions?: number;
        tackles?: number;
    };
}

interface FootballPlayerStatsTableProps {
    teamName: string;
    players: Player[];
}

export default function FootballPlayerStatsTable({ teamName, players }: FootballPlayerStatsTableProps) {
    // Filtrar jugadores que han jugado (tienen minutos)
    // Nota: A veces la API devuelve titulares sin minutos si el partido no ha empezado, 
    // pero para "live" queremos ver quién está jugando.
    // Si no hay stats de minutos, mostramos a los titulares (substitute: false)
    const activePlayers = players.filter(p =>
        (p.statistics && p.statistics.minutesPlayed && p.statistics.minutesPlayed > 0) ||
        (!p.substitute && !p.statistics)
    );

    // Ordenar: Titulares primero, luego por rating o minutos
    activePlayers.sort((a, b) => {
        if (a.substitute !== b.substitute) return a.substitute ? 1 : -1;
        return (b.statistics?.rating || 0) - (a.statistics?.rating || 0);
    });

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6 border border-gray-800">
            <h3 className="bg-gray-800 px-4 py-3 text-white font-bold border-b border-gray-700 flex justify-between items-center">
                <span>{teamName}</span>
                <span className="text-xs text-gray-400 font-normal">Jugadores</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                        <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Jugador</th>
                            <th className="px-2 py-2 text-center">Min</th>
                            <th className="px-2 py-2 text-center font-bold text-white">Rat</th>
                            <th className="px-2 py-2 text-center">G</th>
                            <th className="px-2 py-2 text-center">A</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activePlayers.map((player, index) => {
                            const ratingColor = (player.statistics?.rating || 0) >= 7.5 ? 'text-green-400 font-bold' :
                                (player.statistics?.rating || 0) >= 6.5 ? 'text-blue-300' : 'text-gray-400';

                            return (
                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-2 text-gray-500 text-xs">
                                        {player.shirtNumber || player.player.jerseyNumber || '-'}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-white">
                                        <div className="flex flex-col">
                                            <span>{player.player.name}</span>
                                            <span className="text-[10px] text-gray-500">{player.position || player.player.position}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs text-gray-400">
                                        {player.statistics?.minutesPlayed ? `${player.statistics.minutesPlayed}'` : '-'}
                                    </td>
                                    <td className={`px-2 py-2 text-center ${ratingColor}`}>
                                        {player.statistics?.rating ? player.statistics.rating.toFixed(1) : '-'}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {player.statistics?.goals || 0 > 0 ? (
                                            <span className="text-green-500 font-bold">⚽ {player.statistics?.goals}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-2 py-2 text-center text-gray-400">
                                        {player.statistics?.assists || '-'}
                                    </td>
                                </tr>
                            );
                        })}
                        {activePlayers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                    No hay datos de jugadores disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
