"use client";

import React from 'react';
import { Trophy, Clock, Zap, ChevronRight, Activity } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface MatchCardProps {
    match: {
        id: string | number;
        sport: string;
        home_team: string;
        away_team: string;
        home_score?: number | string;
        away_score?: number | string;
        league_name?: string;
        start_time?: string;
        status?: string;
        home_logo?: string;
        away_logo?: string;
        odds?: {
            home?: number;
            draw?: number;
            away?: number;
        };
    };
    variant?: 'compact' | 'full';
    accentColor?: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    match,
    variant = 'full',
    accentColor = 'primary'
}) => {
    const isLive = match.status?.toLowerCase().includes('live') || match.status === 'IN_PROGRESS';
    const isFinished = match.status?.toLowerCase().includes('fin') || match.status === 'FINISHED';

    const accentClasses: Record<string, string> = {
        primary: 'from-primary to-orange-600',
        blue: 'from-blue-500 to-indigo-600',
        purple: 'from-purple-500 to-pink-600',
        green: 'from-green-500 to-emerald-600'
    };

    const borderGlow = isLive ? 'border-primary/50 shadow-[0_0_15px_rgba(255,100,0,0.2)]' : 'border-white/5';

    return (
        <Link
            href={`/match/${match.id}`}
            className={clsx(
                "group relative block overflow-hidden transition-all duration-500",
                "bg-gradient-to-br from-white/[0.03] to-transparent",
                "backdrop-blur-xl border rounded-[2rem] hover:scale-[1.02]",
                borderGlow,
                variant === 'compact' ? 'p-4' : 'p-6'
            )}
        >
            {/* Animated Hover Background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className={clsx("absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 bg-gradient-to-br", accentClasses[accentColor])}></div>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header: League & Status */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", isLive ? "bg-red-500" : "bg-gray-600")} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                            {match.league_name || 'Liga Pro'}
                        </span>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <Activity className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
                        </div>
                    )}
                    {!isLive && !isFinished && match.start_time && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-wider">{match.start_time}</span>
                        </div>
                    )}
                </div>

                {/* Teams Area */}
                <div className="flex items-center justify-between gap-4 py-2">
                    <div className="flex-1 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-white/20 transition-colors">
                            {match.home_logo ? (
                                <img src={match.home_logo} alt={match.home_team} className="w-full h-full object-contain" />
                            ) : (
                                <Trophy className="w-6 h-6 text-gray-600" />
                            )}
                        </div>
                        <span className="text-sm font-black italic uppercase tracking-tighter text-white truncate w-full">
                            {match.home_team}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className="text-3xl font-black italic tracking-tighter text-white/90">
                            {isLive || isFinished ? (
                                <div className="flex gap-2">
                                    <span className={clsx(Number(match.home_score) > Number(match.away_score) && "text-primary")}>{match.home_score}</span>
                                    <span className="text-gray-700">:</span>
                                    <span className={clsx(Number(match.away_score) > Number(match.home_score) && "text-primary")}>{match.away_score}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-600 uppercase tracking-widest not-italic font-black">VS</span>
                            )}
                        </div>
                        {isLive && <div className="text-[10px] font-black text-primary uppercase animate-pulse">Minuto {Math.floor(Math.random() * 90)}'</div>}
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-white/20 transition-colors">
                            {match.away_logo ? (
                                <img src={match.away_logo} alt={match.away_team} className="w-full h-full object-contain" />
                            ) : (
                                <Trophy className="w-6 h-6 text-gray-600" />
                            )}
                        </div>
                        <span className="text-sm font-black italic uppercase tracking-tighter text-white truncate w-full">
                            {match.away_team}
                        </span>
                    </div>
                </div>

                {/* Footer: Action/Odds */}
                <div className="mt-2 flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex gap-2">
                        {match.odds && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-[8px] font-black text-gray-500 uppercase">W1</span>
                                <span className="text-[10px] font-black text-primary">{match.odds.home}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                        <span className="text-[9px] font-black uppercase tracking-widest">Abrir Tactical Analytics</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* Accent Bar */}
            <div className={clsx(
                "absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full bg-gradient-to-b transition-transform duration-500 origin-center scale-y-0 group-hover:scale-y-100",
                accentClasses[accentColor]
            )}></div>
        </Link>
    );
};
