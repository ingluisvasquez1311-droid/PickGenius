'use client';

import React from 'react';
import Link from 'next/link';

interface LiveEvent {
    id: string;
    homeTeam: {
        name: string;
        id: number;
    };
    awayTeam: {
        name: string;
        id: number;
    };
    homeScore?: {
        current: number;
    };
    awayScore?: {
        current: number;
    };
    status: {
        description: string;
        type: string;
    };
    tournament: {
        name: string;
    };
}

interface EventCardProps {
    event: LiveEvent;
    sport: 'basketball' | 'football';
}

const EventCard: React.FC<EventCardProps> = ({ event, sport }) => {
    const isLive = event.status.type === 'inprogress';
    const isFinished = event.status.type === 'finished';

    return (
        <Link
            href={`/${sport}-live/${event.id}`}
            className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-500"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isLive && (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-bold">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            EN VIVO
                        </span>
                    )}
                    {isFinished && (
                        <span className="text-xs text-gray-500 font-semibold">
                            FINALIZADO
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-500">{event.tournament.name}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">
                            {event.homeTeam.name}
                        </span>
                        <span className="text-xl font-bold text-blue-400">
                            {event.homeScore?.current ?? '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                            {event.awayTeam.name}
                        </span>
                        <span className="text-xl font-bold text-red-400">
                            {event.awayScore?.current ?? '-'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-3 text-xs text-center text-gray-400">
                {event.status.description}
            </div>
        </Link>
    );
};

interface LiveEventsListProps {
    events: LiveEvent[];
    sport: 'basketball' | 'football';
    title: string;
}

export default function LiveEventsList({ events, sport, title }: LiveEventsListProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No hay eventos en este momento</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} sport={sport} />
                ))}
            </div>
        </div>
    );
}
