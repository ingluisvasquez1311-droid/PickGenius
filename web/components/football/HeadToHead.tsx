'use client';

import React from 'react';

interface H2HEvent {
    id: number;
    homeTeam: {
        name: string;
    };
    awayTeam: {
        name: string;
    };
    homeScore: {
        current: number;
    };
    awayScore: {
        current: number;
    };
    startTimestamp: number;
    tournament?: {
        name: string;
    };
}

interface HeadToHeadProps {
    events: H2HEvent[];
    currentHomeTeam: string;
    currentAwayTeam: string;
}

export default function HeadToHead({ events, currentHomeTeam, currentAwayTeam }: HeadToHeadProps) {
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getWinner = (event: H2HEvent) => {
        if (event.homeScore.current > event.awayScore.current) {
            return event.homeTeam.name;
        } else if (event.awayScore.current > event.homeScore.current) {
            return event.awayTeam.name;
        }
        return 'Empate';
    };

    const getResultColor = (event: H2HEvent) => {
        const winner = getWinner(event);
        if (winner === currentHomeTeam) return 'text-blue-400';
        if (winner === currentAwayTeam) return 'text-red-400';
        return 'text-gray-400';
    };

    // Calcular estadísticas
    const stats = events.reduce((acc, event) => {
        const winner = getWinner(event);
        if (winner === currentHomeTeam) acc.homeWins++;
        else if (winner === currentAwayTeam) acc.awayWins++;
        else acc.draws++;
        return acc;
    }, { homeWins: 0, awayWins: 0, draws: 0 });

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <h3 className="bg-gray-800 px-4 py-3 text-white font-bold border-b border-gray-700 flex items-center gap-2">
                <span>🆚</span>
                Historial de Enfrentamientos
            </h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-gray-800/50 border-b border-gray-700">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.homeWins}</div>
                    <div className="text-xs text-gray-400">{currentHomeTeam}</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{stats.draws}</div>
                    <div className="text-xs text-gray-400">Empates</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.awayWins}</div>
                    <div className="text-xs text-gray-400">{currentAwayTeam}</div>
                </div>
            </div>

            {/* Recent Matches */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
                {events.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 italic">
                        No hay historial disponible
                    </p>
                ) : (
                    <div className="space-y-3">
                        {events.slice(0, 10).map((event, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500">
                                        {formatDate(event.startTimestamp)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {event.tournament?.name || 'Torneo'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 text-sm text-white">
                                        {event.homeTeam.name}
                                    </div>
                                    <div className={`px-3 py-1 rounded font-bold ${getResultColor(event)}`}>
                                        {event.homeScore.current} - {event.awayScore.current}
                                    </div>
                                    <div className="flex-1 text-sm text-white text-right">
                                        {event.awayTeam.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
