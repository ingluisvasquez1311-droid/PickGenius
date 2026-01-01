"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Star, ChevronDown, ChevronRight, BarChart3, Flame, Users, Clock } from 'lucide-react';
import clsx from 'clsx';
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
        <div className="overflow-hidden rounded-[2.5rem] border-2 border-white/5 bg-[#080808] shadow-2xl transition-all duration-500">
            {/* Tournament Header - Industrial Style (Compact) */}
            <div
                onClick={onToggle}
                className="p-3 bg-white/[0.03] flex items-center justify-between cursor-pointer hover:bg-white/5 border-b-2 border-white/5 group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary transition-colors">
                        <Star className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" />
                    </div>

                    <div className="relative">
                        <Image
                            src={getCategoryImage(categoryId)}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white/10"
                            alt=""
                            width={32}
                            height={32}
                            placeholder="blur"
                            blurDataURL={getBlurDataURL()}
                        />
                        <Image
                            src={getTournamentImage(tournamentId)}
                            className="w-5 h-5 rounded-md absolute -bottom-1.5 -right-1.5 border-2 border-black bg-black"
                            alt=""
                            width={20}
                            height={20}
                            placeholder="blur"
                            blurDataURL={getBlurDataURL()}
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
                            {group.category?.name || 'Mundo'}
                        </span>
                        <h3 className={clsx("text-base font-black text-white tracking-tighter uppercase italic transition-colors", hoverTextAccent)}>
                            {group.info.name}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Dynamic Badges - Scouts Removed */}
                    {group.events.length > 5 && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20">
                            <Flame className="w-3 h-3 text-red-600 animate-bounce" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Hot</span>
                        </div>
                    )}

                    <div className="p-1.5 bg-white/5 rounded-lg text-gray-500 group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                </div>
            </div>

            {/* Matches List - Brutalist Rows */}
            {isExpanded && (
                <div className="divide-y-2 divide-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                    {group.events.map((event: any) => (
                        <div
                            key={event?.id}
                            onClick={() => onClickMatch(event?.id)}
                            className="flex flex-col md:flex-row items-center gap-8 p-8 hover:bg-white/[0.02] active:bg-white/5 transition-all cursor-pointer group/row relative overflow-hidden"
                        >
                            <div className={clsx("absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover/row:scale-y-100 transition-transform duration-500", bgAccent)}></div>

                            {/* Status Section */}
                            <div className="w-full md:w-32 shrink-0 flex items-center justify-between md:flex-col md:items-start gap-2">
                                {mode === 'live' || event?.status?.type === 'inprogress' ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                            <span className="text-sm font-black text-red-500 uppercase italic">
                                                {event?.status?.description}
                                            </span>
                                        </div>
                                        {/* Game Time Display */}
                                        <div className={clsx("text-lg font-mono font-black ml-4 flex items-center gap-1.5", textAccent)}>
                                            <Clock className="w-4 h-4" />
                                            {(() => {
                                                if (event?.status?.time) return event.status.time;

                                                if (event?.time?.currentPeriodStartTimestamp) {
                                                    const start = event.time.currentPeriodStartTimestamp * 1000;
                                                    const now = Date.now();
                                                    const diff = Math.floor((now - start) / 60000);
                                                    let base = 0;
                                                    if (event?.status?.description?.includes('2nd') || event?.status?.description?.includes('2T')) base = 45;

                                                    const calculated = base + diff;
                                                    return `${calculated > 0 ? calculated : 0}'`;
                                                }

                                                return 'EN VIVO';
                                            })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-mono font-black text-white italic tracking-tighter">
                                            {event?.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                        </span>
                                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-[0.4em]">HORA</span>
                                    </div>
                                )}
                                <Star className="w-5 h-5 text-gray-800 hover:text-yellow-500 transition-colors" />

                                {/* AI Confidence Badge */}
                                {event?.aiConfidence && (
                                    <div className="mt-2 flex flex-col items-center gap-1">
                                        <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={clsx(
                                                    "h-full transition-all duration-1000",
                                                    event.aiConfidence >= 75 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                                                        event.aiConfidence >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${event.aiConfidence}%` }}
                                            />
                                        </div>
                                        <span className="text-[7px] font-black text-gray-600 uppercase tracking-tighter">AI {event.aiConfidence}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Main Battle Arena */}
                            <div className="flex-1 w-full grid grid-cols-11 gap-4 items-center px-6 md:border-l-2 border-white/10">
                                {/* Home Team */}
                                <div className="col-span-4 flex items-center gap-3 justify-end group/team">
                                    <span className={clsx(
                                        "text-xs md:text-sm font-black uppercase italic tracking-tight text-right transition-all duration-300",
                                        (event?.homeScore?.current ?? 0) >= (event?.awayScore?.current ?? 0) ? "text-white scale-105" : "text-gray-600 group-hover/row:text-gray-400"
                                    )}>
                                        {event?.homeTeam?.name || 'TBA'}
                                    </span>
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-white/5 rounded-full scale-0 group-hover/team:scale-100 transition-transform"></div>
                                        {event?.homeTeam?.id && (
                                            <Image
                                                src={getTeamImage(event.homeTeam.id)}
                                                className="w-10 h-10 md:w-14 md:h-14 object-contain relative z-10"
                                                alt=""
                                                width={56}
                                                height={56}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Scoreboard */}
                                <div className={clsx("col-span-3 flex items-center justify-center gap-2 py-2 transition-colors")}>
                                    <span className={clsx(
                                        "text-xl font-black italic font-mono min-w-[1em] text-center drop-shadow-glow",
                                        event?.status?.type === 'inprogress' ? "text-red-500" : "text-white"
                                    )}>
                                        {event?.homeScore?.current ?? '-'}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                    <span className={clsx(
                                        "text-xl font-black italic font-mono min-w-[1em] text-center drop-shadow-glow",
                                        event?.status?.type === 'inprogress' ? "text-red-500" : "text-white"
                                    )}>
                                        {event?.awayScore?.current ?? '-'}
                                    </span>
                                </div>

                                {/* Away Team */}
                                <div className="col-span-4 flex items-center gap-3 justify-start group/team">
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-white/5 rounded-full scale-0 group-hover/team:scale-100 transition-transform"></div>
                                        {event?.awayTeam?.id && (
                                            <Image
                                                src={getTeamImage(event.awayTeam.id)}
                                                className="w-10 h-10 md:w-14 md:h-14 object-contain relative z-10"
                                                alt=""
                                                width={56}
                                                height={56}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        )}
                                    </div>
                                    <span className={clsx(
                                        "text-xs md:text-sm font-black uppercase italic tracking-tight transition-all duration-300",
                                        (event?.awayScore?.current ?? 0) >= (event?.homeScore?.current ?? 0) ? "text-white scale-105" : "text-gray-600 group-hover/row:text-gray-400"
                                    )}>
                                        {event?.awayTeam?.name || 'TBA'}
                                    </span>
                                </div>
                            </div>

                            {/* Main Odds (1X2) - Real Time */}
                            {event?.mainOdds && event.mainOdds.length > 0 && (
                                <div className="hidden lg:flex items-center gap-2 px-6 border-l-2 border-white/5">
                                    {event.mainOdds.map((choice: any, cIdx: number) => (
                                        <div
                                            key={cIdx}
                                            className="flex flex-col items-center justify-center w-14 h-12 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-default"
                                        >
                                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-tighter">
                                                {choice?.name === '1' ? 'HOME' : choice?.name === 'X' ? 'DRAW' : choice?.name === '2' ? 'AWAY' : choice?.name}
                                            </span>
                                            <span className="text-xs font-mono font-black text-primary italic">
                                                {choice?.value ? choice.value.toFixed(2) : '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pro Analytics Trigger */}
                            <div className="w-full md:w-16 flex justify-center md:justify-end items-center">
                                <div className={clsx("p-4 rounded-2xl bg-[#111] border-2 border-white/5 transition-all duration-500 shadow-xl", `group-hover/row:${borderAccent}/50`, `group-hover/row:${bgAccent}/10`, `group-hover/row:${shadowAccent}`)}>
                                    <BarChart3 className={clsx("w-4 h-4 group-hover/row:animate-pulse", textAccent)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
