"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Star, ChevronDown, ChevronRight, BarChart3, Flame, Users, Clock } from 'lucide-react';
import clsx from 'clsx';
import { MatchCard } from './MatchCard';
import { getTeamImage, getTournamentImage, getCategoryImage, getBlurDataURL, DEFAULT_IMAGES } from '@/lib/image-utils';

interface TournamentAccordionProps {
    id: string | number;
    group: any;
    isExpanded: boolean;
    onToggle: () => void;
    onClickMatch: (id: number) => void;
    mode: 'live' | 'scheduled';
    accentColor?: 'violet' | 'orange' | 'green' | 'blue' | 'sky';
}

export default function TournamentAccordion({ id, group, isExpanded, onToggle, onClickMatch, mode, accentColor = 'violet' }: TournamentAccordionProps) {
    const accentClasses = {
        violet: 'primary',
        orange: 'orange-500',
        green: 'green-500',
        blue: 'blue-600',
        sky: 'sky-500'
    };

    const textAccent = `text-${accentClasses[accentColor]}`;
    const bgAccent = `bg-${accentClasses[accentColor]}`;
    const borderAccent = `border-${accentClasses[accentColor]}`;
    const shadowAccent = `shadow-${accentClasses[accentColor]}/20`;
    const hoverBorderAccent = `group-hover:border-${accentClasses[accentColor]}`;
    const hoverBgAccent = `group-hover:bg-${accentClasses[accentColor]}`;
    const hoverTextAccent = `group-hover:text-${accentClasses[accentColor]}`;
    const tournamentId = group.info.uniqueId || group.info.id;
    const categoryId = group.category?.id;

    return (
        <div className="overflow-hidden glass-card rounded-[2.5rem] border border-white/10 hover:cyber-border transition-all duration-500 shadow-2xl relative">
            {/* Tournament Header - Ultra-Premium Cyber Style */}
            <div
                onClick={onToggle}
                className="p-4 bg-gradient-to-r from-white/[0.03] to-transparent flex items-center justify-between cursor-pointer hover:bg-white/5 border-b border-white/5 group relative overflow-hidden"
            >
                {/* Active Glow Background */}
                {isExpanded && (
                    <div className={clsx("absolute inset-0 opacity-10 blur-xl", bgAccent)}></div>
                )}

                <div className="flex items-center gap-5 relative z-10">
                    <div className={clsx("p-2.5 rounded-xl border border-white/10 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]", isExpanded ? `${bgAccent} text-black border-transparent scale-110` : "bg-white/5 group-hover:bg-white/10")}>
                        <Star className={clsx("w-4 h-4 transition-colors", isExpanded ? "text-black fill-black" : "text-gray-500 group-hover:text-white")} />
                    </div>

                    <div className="relative group/img">
                        <div className={clsx("absolute -inset-1 rounded-xl opacity-0 group-hover/img:opacity-50 blur-md transition-opacity duration-500", bgAccent)}></div>
                        <Image
                            src={getCategoryImage(categoryId)}
                            className="w-10 h-10 rounded-xl object-cover border-2 border-white/10 relative z-10"
                            alt=""
                            width={40}
                            height={40}
                            placeholder="blur"
                            blurDataURL={getBlurDataURL()}
                        />
                        <Image
                            src={getTournamentImage(tournamentId)}
                            className="w-6 h-6 rounded-lg absolute -bottom-2 -right-2 border-2 border-[#09090b] bg-[#09090b] relative z-20 shadow-lg"
                            alt=""
                            width={24}
                            height={24}
                            placeholder="blur"
                            blurDataURL={getBlurDataURL()}
                        />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                            {group.category?.name || 'Mundo'}
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className={clsx("transition-colors", textAccent)}>PRO LEAGUE</span>
                        </span>
                        <h3 className={clsx("text-lg font-black tracking-tighter uppercase italic transition-all duration-300 drop-shadow-lg", isExpanded ? "text-white scale-105 origin-left" : "text-gray-300 group-hover:text-white")}>
                            {group.info.name}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    {/* Dynamic Badges - Cyber Style */}
                    {group.events.length > 3 && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-600/20 to-transparent border border-red-600/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                            <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Trending</span>
                        </div>
                    )}

                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-all duration-500", isExpanded ? "bg-white text-black rotate-180" : "bg-white/5 text-gray-400 group-hover:bg-white/10")}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Matches List - Universal MatchCard Grid */}
            {isExpanded && (
                <div className="p-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-black/40 backdrop-blur-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {group.events.map((event: any) => {
                            // Map Sofascore event to MatchCard format
                            const mcMatch = {
                                id: event.id,
                                sport: mode === 'live' ? 'football' : 'football', // default to football for this component
                                home_team: event.homeTeam?.name || 'TBA',
                                away_team: event.awayTeam?.name || 'TBA',
                                home_score: event.homeScore?.current,
                                away_score: event.awayScore?.current,
                                league_name: group.info.name,
                                start_time: event.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : undefined,
                                status: event.status?.type === 'inprogress' ? 'LIVE' : (event.status?.type === 'finished' ? 'FINISHED' : 'SCHEDULED'),
                                home_logo: getTeamImage(event.homeTeam?.id),
                                away_logo: getTeamImage(event.awayTeam?.id),
                                odds: event.mainOdds?.[0] ? {
                                    home: event.mainOdds.find((o: any) => o.name === '1')?.value,
                                    draw: event.mainOdds.find((o: any) => o.name === 'X')?.value,
                                    away: event.mainOdds.find((o: any) => o.name === '2')?.value
                                } : undefined
                            };

                            return (
                                <MatchCard
                                    key={event.id}
                                    match={mcMatch}
                                    accentColor={accentColor === 'violet' ? 'primary' : accentColor as any}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
