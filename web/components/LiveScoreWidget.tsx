"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronDown, ChevronUp, X, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface LiveMatch {
    id: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: any;
    awayScore: any;
    minute?: string;
    status?: any;
}

export default function LiveScoreWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

    const {
        data: liveMatches = [],
        isLoading: loading,
        isFetching: refreshing,
        dataUpdatedAt
    } = useQuery({
        queryKey: ['live-matches'],
        queryFn: async () => {
            const [footballRes, basketballRes] = await Promise.allSettled([
                fetch('/api/live/football'),
                fetch('/api/live/basketball')
            ]);

            const matches: LiveMatch[] = [];

            if (footballRes.status === 'fulfilled') {
                const data = await footballRes.value.json();
                const footballMatches = (data.events || []).slice(0, 3).map((e: any) => ({
                    id: e.id,
                    sport: 'football',
                    homeTeam: e.homeTeam.name,
                    awayTeam: e.awayTeam.name,
                    homeScore: e.homeScore,
                    awayScore: e.awayScore,
                    status: e.status,
                    minute: e.time?.currentPeriodStartTimestamp ? `${Math.floor((Date.now() / 1000 - e.time.currentPeriodStartTimestamp) / 60)}'` : undefined
                }));
                matches.push(...footballMatches);
            }

            if (basketballRes.status === 'fulfilled') {
                const data = await basketballRes.value.json();
                const basketballMatches = (data.events || []).slice(0, 2).map((e: any) => ({
                    id: e.id,
                    sport: 'basketball',
                    homeTeam: e.homeTeam.name,
                    awayTeam: e.awayTeam.name,
                    homeScore: e.homeScore,
                    awayScore: e.awayScore,
                    status: e.status,
                    minute: e.time?.played ? `Q${e.time.period}` : undefined
                }));
                matches.push(...basketballMatches);
            }

            return matches;
        },
        refetchInterval: 20000, // Refresh every 20 seconds
    });

    if (isMinimized) return null;
    if (liveMatches.length === 0 && !loading) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Collapsed State - Floating Glass Pill */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="group bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] transition-all duration-500 flex items-center gap-4 animate-in slide-in-from-bottom-8 overflow-hidden relative border border-white/10 hover:scale-105 active:scale-95"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-white/40 blur-sm rounded-full animate-ping"></div>
                        <Activity className={clsx("w-5 h-5 relative z-10", refreshing ? "animate-spin" : "")} />
                    </div>

                    <div className="flex flex-col items-start translate-y-[-1px] relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none drop-shadow-md">EN VIVO</span>
                        <span className="text-[9px] font-bold text-white/80 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            {liveMatches.length} Activos
                        </span>
                    </div>
                    <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}

            {/* Expanded State */}
            {isExpanded && (
                <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-80 animate-in slide-in-from-bottom-8 slide-in-from-right-8 fade-in duration-500 overflow-hidden">
                    {/* Header - Cyber Glass */}
                    <div className="bg-gradient-to-r from-primary/20 via-blue-600/10 to-transparent p-5 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                        <div className="flex flex-col relative z-9">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/40 blur-md rounded-full animate-ping"></div>
                                    <Activity className={clsx("w-3.5 h-3.5 text-primary relative z-10", refreshing ? "animate-spin" : "")} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-glow">RADAR EN VIVO</h3>
                            </div>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                Sinc: {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white hover:scale-110 active:scale-95">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-gray-400 hover:text-red-400 hover:scale-110 active:scale-95">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Matches List */}
                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                        {loading && liveMatches.length === 0 ? (
                            <div className="p-12 text-center">
                                <Activity className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Conectando...</p>
                            </div>
                        ) : (
                            <div className="space-y-1 p-3">
                                {liveMatches.map((match) => {
                                    const isThisMatchExpanded = expandedMatchId === match.id;
                                    return (
                                        <div key={match.id} className="relative group">
                                            <div
                                                onClick={() => setExpandedMatchId(isThisMatchExpanded ? null : match.id)}
                                                className={clsx(
                                                    "w-full text-left glass-card border rounded-2xl p-4 transition-all duration-300 cursor-pointer relative overflow-hidden group/card",
                                                    isThisMatchExpanded ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className={clsx("absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300", isThisMatchExpanded ? "bg-primary h-full" : "bg-transparent h-0")}></div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={clsx(
                                                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                                                            match.minute ? "bg-green-500 animate-ping" : "bg-gray-600"
                                                        )}></div>
                                                        <div className={clsx(
                                                            "absolute w-1.5 h-1.5 rounded-full",
                                                            match.minute ? "bg-green-500" : "bg-gray-600"
                                                        )}></div>
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">
                                                            {match.sport === 'football' ? 'Fútbol' : 'NBA'}
                                                            {match.minute && <span className="text-primary ml-1 font-mono italic">• {match.minute}</span>}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className={clsx(
                                                        "w-3 h-3 text-gray-600 transition-all duration-300",
                                                        isThisMatchExpanded && "rotate-90 text-primary scale-125"
                                                    )} />
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <p className={clsx("text-xs font-black uppercase italic truncate flex items-center gap-2 transition-colors", match.homeScore?.current > match.awayScore?.current ? "text-white text-shadow-sm" : "text-gray-400")}>
                                                            <span className={clsx("w-1 h-1 rounded-full", match.homeScore?.current > match.awayScore?.current ? "bg-primary shadow-[0_0_5px_var(--primary)]" : "bg-white/10")}></span>
                                                            {match.homeTeam}
                                                        </p>
                                                        <p className={clsx("text-xs font-black uppercase italic truncate flex items-center gap-2 transition-colors", match.awayScore?.current > match.homeScore?.current ? "text-white text-shadow-sm" : "text-gray-400")}>
                                                            <span className={clsx("w-1 h-1 rounded-full", match.awayScore?.current > match.homeScore?.current ? "bg-primary shadow-[0_0_5px_var(--primary)]" : "bg-white/10")}></span>
                                                            {match.awayTeam}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col justify-center items-end bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner min-w-[3.5rem]">
                                                        <p className={clsx("text-lg font-black italic font-mono leading-tight", match.homeScore?.current > match.awayScore?.current ? "text-white drop-shadow-glow" : "text-gray-500")}>{match.homeScore?.current ?? 0}</p>
                                                        <p className={clsx("text-lg font-black italic font-mono leading-tight", match.awayScore?.current > match.homeScore?.current ? "text-white drop-shadow-glow" : "text-gray-500")}>{match.awayScore?.current ?? 0}</p>
                                                    </div>
                                                </div>

                                                {isThisMatchExpanded && (
                                                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="flex justify-between items-center text-[7px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2 px-1">
                                                            <span>PARCIALES</span>
                                                            <div className="flex gap-3">
                                                                {['P1', 'P2', 'P3', 'P4'].map(p => <span key={p} className="w-5 text-center">{p}</span>)}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center bg-black/20 rounded-lg p-2 border border-white/5">
                                                                <span className="text-[9px] font-black uppercase text-white truncate max-w-[80px]">{match.homeTeam}</span>
                                                                <div className="flex gap-3">
                                                                    {[1, 2, 3, 4].map(p => (
                                                                        <span key={p} className="w-5 text-center text-[10px] font-mono font-black text-primary/80">
                                                                            {match.homeScore[`period${p}`] ?? '-'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-black/20 rounded-lg p-2 border border-white/5">
                                                                <span className="text-[9px] font-black uppercase text-gray-400 truncate max-w-[80px]">{match.awayTeam}</span>
                                                                <div className="flex gap-3">
                                                                    {[1, 2, 3, 4].map(p => (
                                                                        <span key={p} className="w-5 text-center text-[10px] font-mono font-black text-gray-600">
                                                                            {match.awayScore[`period${p}`] ?? '-'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/match/${match.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border border-primary/20 hover:border-primary/40 rounded-xl transition-all group/btn shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                                                        >
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover/btn:text-white transition-colors">Análisis IA Completo</span>
                                                            <ArrowRight className="w-3 h-3 text-primary group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
