'use client';

import React from 'react';
import Link from 'next/link';

interface LiveEvent {
    id: string;
    homeTeam: {
        name: string;
        id: number;
        logo?: string;
    };
    awayTeam: {
        name: string;
        id: number;
        logo?: string;
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
    startTimestamp?: number;
}

interface EventCardProps {
    event: LiveEvent;
    sport: 'basketball' | 'football';
}

const EventCard: React.FC<EventCardProps> = ({ event, sport }) => {
    const isLive = event.status.type === 'inprogress';
    const isFinished = event.status.type === 'finished';
    const [mvpData, setMvpData] = React.useState<any>(null);

    // Fetch Real MVP Data w/ AI Analysis on mount
    React.useEffect(() => {
        if (sport !== 'basketball') return; // Only basketball has best-player endpoint for now

        const fetchMVP = async () => {
            try {
                const res = await fetch(`/api/basketball/match/${event.id}/best-player`);
                const json = await res.json();
                if (json.success && json.data) {
                    setMvpData(json.data);
                }
            } catch (e) {
                console.error("Failed to fetch MVP", e);
            }
        };

        // Delay slightly to prevent waterfall if many cards
        const timer = setTimeout(fetchMVP, 500 + Math.random() * 1000);
        return () => clearTimeout(timer);
    }, [event.id, sport]);

    // Construct Logo URLs if missing (Fallback)
    const homeLogo = event.homeTeam.logo || `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`;
    const awayLogo = event.awayTeam.logo || `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`;

    return (
        <Link
            href={`/${sport}-live/${event.id}`}
            className="group relative block overflow-hidden rounded-3xl bg-[#080808] border border-white/5 p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:border-green-500/50"
        >
            {/* Background Image / Texture */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/80"></div>

            {/* MVP Widget (Real Data) */}
            {mvpData && (
                <div className="absolute top-0 right-0 p-4 z-20">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2 flex items-center gap-3 transform translate-x-4 -translate-y-2 hover:translate-x-0 hover:translate-y-0 transition-transform duration-300 shadow-xl">
                        <div className="relative">
                            <img
                                src={mvpData.mvp.imageUrl}
                                alt={mvpData.mvp.name}
                                className="h-10 w-10 rounded-full object-cover border border-white/20"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className={`absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded ${mvpData.mvp.team === 'home' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>MVP</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-green-400 uppercase font-black tracking-widest leading-none mb-0.5">
                                {mvpData.ai.title}
                            </div>
                            <div className="text-xs font-bold text-white leading-none">{mvpData.mvp.name}</div>
                            <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                                {mvpData.mvp.stats.pts}PTS • {mvpData.mvp.stats.ast}AST • {mvpData.mvp.stats.reb}REB
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">

                {/* Header: League & Status */}
                <div className="flex items-center gap-2 mb-6">
                    {isLive ? (
                        <div className="flex items-center gap-1.5 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            </span>
                            LIVE
                        </div>
                    ) : (
                        <div className="rounded bg-gray-700/30 px-2 py-0.5 text-[10px] font-bold text-gray-400 border border-white/10">
                            {event.status.description}
                        </div>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 border-l border-white/10 pl-2">
                        {event.tournament.name}
                    </span>
                </div>

                {/* Scoreboard Section */}
                <div className="flex items-center justify-between gap-4">

                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <img
                            src={homeLogo}
                            alt={event.homeTeam.name}
                            className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Anonymous_emblem.svg'; }}
                        />
                        <span className="text-center text-sm font-bold text-gray-300 leading-tight">
                            {event.homeTeam.name}
                        </span>
                    </div>

                    {/* VS / Score */}
                    <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm min-w-[100px]">
                        {isLive || isFinished ? (
                            <div className="flex items-center gap-3">
                                <span className={`text-3xl font-black tabular-nums tracking-tighter ${event.homeScore?.current! > event.awayScore?.current! ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-gray-500'}`}>
                                    {event.homeScore?.current}
                                </span>
                                <span className="text-gray-700 font-bold text-xl">:</span>
                                <span className={`text-3xl font-black tabular-nums tracking-tighter ${event.awayScore?.current! > event.homeScore?.current! ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-gray-500'}`}>
                                    {event.awayScore?.current}
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-black text-gray-600 tracking-widest">VS</span>
                        )}
                        <div className="mt-1 h-0.5 w-12 bg-white/10 rounded-full overflow-hidden">
                            {isLive && <div className="h-full bg-green-500 w-1/2 animate-loading-bar"></div>}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <img
                            src={awayLogo}
                            alt={event.awayTeam.name}
                            className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Anonymous_emblem.svg'; }}
                        />
                        <span className="text-center text-sm font-bold text-gray-300 leading-tight">
                            {event.awayTeam.name}
                        </span>
                    </div>

                </div>

                {/* Footer Mod: Odds or Stats */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold text-green-500">
                            {sport === 'basketball' ? 'Q4 Momentum' : 'Possession'}
                        </span>
                    </div>
                    {/* Fake Live Odds Animation */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Live Odds</span>
                        <div className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-mono font-bold border border-green-500/20">
                            {event.id.slice(0, 2) === '11' ? '1.85' : '2.10'}
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
};

import SkeletonLoader from './ui/SkeletonLoader';

// ... (existing interfaces)

interface LiveEventsListProps {
    events: LiveEvent[];
    sport: 'basketball' | 'football';
    title: string;
    loading?: boolean;
}

export default function LiveEventsList({ events, sport, title, loading }: LiveEventsListProps) {
    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[140px] rounded-lg overflow-hidden relative">
                            <SkeletonLoader />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
