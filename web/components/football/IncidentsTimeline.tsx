'use client';

import React from 'react';

interface Incident {
    id: number;
    time: number;
    addedTime?: number;
    incidentType: string;
    incidentClass: string;
    text?: string;
    player?: {
        name: string;
    };
    playerIn?: {
        name: string;
    };
    playerOut?: {
        name: string;
    };
    isHome: boolean;
}

interface IncidentsTimelineProps {
    incidents: Incident[];
    homeTeam: string;
    awayTeam: string;
}

export default function IncidentsTimeline({ incidents, homeTeam, awayTeam }: IncidentsTimelineProps) {
    const getIncidentIcon = (type: string) => {
        switch (type) {
            case 'goal':
                return '⚽';
            case 'card':
                return '🟨';
            case 'substitution':
                return '🔄';
            case 'period':
                return '⏱️';
            default:
                return '📌';
        }
    };

    const getIncidentColor = (incidentClass: string) => {
        switch (incidentClass) {
            case 'goal':
                return 'bg-green-500/20 border-green-500/50';
            case 'card':
                return 'bg-yellow-500/20 border-yellow-500/50';
            case 'redCard':
                return 'bg-red-500/20 border-red-500/50';
            case 'substitution':
                return 'bg-blue-500/20 border-blue-500/50';
            default:
                return 'bg-gray-700/20 border-gray-600/50';
        }
    };

    const formatTime = (time: number, addedTime?: number) => {
        if (addedTime) {
            return `${time}+${addedTime}'`;
        }
        return `${time}'`;
    };

    const getIncidentText = (incident: Incident) => {
        if (incident.text) return incident.text;

        switch (incident.incidentType) {
            case 'goal':
                return `Gol de ${incident.player?.name || 'Desconocido'}`;
            case 'card':
                return `Tarjeta para ${incident.player?.name || 'Desconocido'}`;
            case 'substitution':
                return `${incident.playerIn?.name || 'Jugador'} entra por ${incident.playerOut?.name || 'Jugador'}`;
            default:
                return incident.incidentType;
        }
    };

    // Ordenar incidentes por tiempo (más reciente primero)
    const sortedIncidents = [...incidents].sort((a, b) => {
        const timeA = a.time + (a.addedTime || 0);
        const timeB = b.time + (b.addedTime || 0);
        return timeB - timeA;
    });

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <h3 className="bg-gray-800 px-4 py-3 text-white font-bold border-b border-gray-700 flex items-center gap-2">
                <span>⏱️</span>
                Línea de Tiempo
            </h3>
            <div className="p-4 max-h-[500px] overflow-y-auto">
                {sortedIncidents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 italic">
                        No hay eventos registrados aún
                    </p>
                ) : (
                    <div className="space-y-3">
                        {sortedIncidents.map((incident, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${getIncidentColor(incident.incidentClass)} transition-all hover:scale-[1.02]`}
                            >
                                {/* Time Badge */}
                                <div className="flex-shrink-0 w-12 text-center">
                                    <div className="bg-gray-800 rounded px-2 py-1 text-xs font-bold text-white">
                                        {formatTime(incident.time, incident.addedTime)}
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="text-2xl flex-shrink-0">
                                    {getIncidentIcon(incident.incidentType)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm">
                                        {getIncidentText(incident)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {incident.isHome ? homeTeam : awayTeam}
                                    </p>
                                </div>

                                {/* Team Indicator */}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${incident.isHome ? 'bg-blue-500' : 'bg-red-500'}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
