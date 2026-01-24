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
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2 max-w-[60%]">
                        <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0", isLive ? "bg-red-500" : "bg-gray-600")} />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-500 truncate">
                            {match.league_name || 'Torneo'}
                        </span>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
                            <Activity className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none">LIVE</span>
                        </div>
                    )}
                    {!isLive && !isFinished && match.start_time && (
                        <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-wider">{match.start_time}</span>
                        </div>
                    )}
                </div>

                {/* Teams Area - Compact & Safe */}
                <div className="flex items-center justify-between gap-3 py-3">
                    {/* HOME TEAM */}
                    <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-[30%]">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-white/20 transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            {match.home_logo ? (
                                <img src={match.home_logo} alt={match.home_team} className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                                <Trophy className="w-5 h-5 text-gray-600" />
                            )}
                        </div>
                        <span className="text-[10px] md:text-xs font-black italic uppercase tracking-tight text-gray-200 leading-tight w-full line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                            {match.home_team.replace(/FC|CF|Club/g, '').trim()}
                        </span>
                    </div>

                    {/* SCOREBOARD */}
                    <div className="flex flex-col items-center justify-center gap-1 shrink-0 min-w-[50px]">
                        <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
                            {isLive || isFinished ? (
                                <div className="flex gap-1.5 items-center justify-center">
                                    <span className={clsx(Number(match.home_score) > Number(match.away_score) ? "text-primary drop-shadow-[0_0_8px_rgba(255,100,0,0.5)]" : "text-gray-300")}>
                                        {match.home_score}
                                    </span>
                                    <span className="text-gray-600 text-lg">:</span>
                                    <span className={clsx(Number(match.away_score) > Number(match.home_score) ? "text-primary drop-shadow-[0_0_8px_rgba(255,100,0,0.5)]" : "text-gray-300")}>
                                        {match.away_score}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[10px] text-gray-600 uppercase tracking-widest not-italic font-black bg-white/5 px-2 py-1 rounded-md">VS</span>
                            )}
                        </div>
                        {isLive && (
                            <div className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[8px] font-black text-green-500 uppercase tracking-wide">
                                    {/* MOCK MINUTE IF NO REAL DATA, BUT PREFER REAL */}
                                    ACTIVO
                                </span>
                            </div>
                        )}
                    </div>

                    {/* AWAY TEAM */}
                    <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-[30%]">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-white/20 transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            {match.away_logo ? (
                                <img src={match.away_logo} alt={match.away_team} className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                                <Trophy className="w-5 h-5 text-gray-600" />
                            )}
                        </div>
                        <span className="text-[10px] md:text-xs font-black italic uppercase tracking-tight text-gray-200 leading-tight w-full line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                            {match.away_team.replace(/FC|CF|Club/g, '').trim()}
                        </span>
                    </div>
                </div>

                {/* Footer: Action Button Only (Cleaner) */}
                <div className="mt-1 flex justify-center border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-primary transition-colors text-[9px] font-black uppercase tracking-widest">
                        <span>ANÁLISIS TÁCTICO</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
