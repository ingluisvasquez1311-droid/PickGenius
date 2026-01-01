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
            {/* Collapsed State */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="group bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-primary/50 transition-all flex items-center gap-3 animate-in slide-in-from-bottom-8 overflow-hidden relative"
                >
                    <Activity className={clsx("w-5 h-5", refreshing ? "animate-spin" : "animate-pulse")} />
                    <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">EN VIVO</span>
                        <span className="text-[10px] font-bold text-white/70 mt-1">{liveMatches.length} partidos</span>
                    </div>
                    <ChevronUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                    {refreshing && (
                        <div className="absolute bottom-0 left-0 h-[2px] bg-white/40 animate-[progress_1s_infinite]" style={{ width: '100%' }}></div>
                    )}
                </button>
            )}

            {/* Expanded State */}
            {isExpanded && (
                <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-80 animate-in slide-in-from-bottom-8 slide-in-from-right-8 fade-in duration-500 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 p-5 flex items-center justify-between border-b border-white/5">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Activity className={clsx("w-3.5 h-3.5 text-primary", refreshing ? "animate-spin" : "animate-pulse")} />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">RADAR EN VIVO</h3>
                            </div>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                Sinc: {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-red-400">
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
                                                    "w-full text-left bg-white/[0.01] hover:bg-white/[0.03] border rounded-2xl p-4 transition-all duration-300 cursor-pointer",
                                                    isThisMatchExpanded ? "border-primary/40 bg-primary/5" : "border-white/5"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={clsx(
                                                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                                                            match.minute ? "bg-green-500 animate-pulse" : "bg-gray-600"
                                                        )}></div>
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                            {match.sport === 'football' ? 'Fútbol' : 'NBA/Basketball'}
                                                            {match.minute && <span className="text-primary ml-1">• {match.minute}</span>}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className={clsx(
                                                        "w-3 h-3 text-gray-600 transition-transform duration-300",
                                                        isThisMatchExpanded && "rotate-90 text-primary"
                                                    )} />
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-xs font-black text-white truncate flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                            {match.homeTeam}
                                                        </p>
                                                        <p className="text-xs font-black text-gray-400 truncate flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                            {match.awayTeam}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col justify-center items-end bg-black/20 px-3 py-1 rounded-xl border border-white/5">
                                                        <p className="text-lg font-black italic text-white leading-tight">{match.homeScore?.current ?? 0}</p>
                                                        <p className="text-lg font-black italic text-gray-400 leading-tight">{match.awayScore?.current ?? 0}</p>
                                                    </div>
                                                </div>

                                                {isThisMatchExpanded && (
                                                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="flex justify-between items-center text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2 px-1">
                                                            <span>PARCIALES</span>
                                                            <div className="flex gap-3">
                                                                {['P1', 'P2', 'P3', 'P4'].map(p => <span key={p} className="w-5 text-center">{p}</span>)}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-center bg-white/5 rounded-lg p-1.5 border border-white/5">
                                                                <span className="text-[9px] font-bold text-white truncate max-w-[80px]">{match.homeTeam}</span>
                                                                <div className="flex gap-3">
                                                                    {[1, 2, 3, 4].map(p => (
                                                                        <span key={p} className="w-5 text-center text-[10px] font-black text-primary">
                                                                            {match.homeScore[`period${p}`] ?? 0}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white/5 rounded-lg p-1.5 border border-white/5">
                                                                <span className="text-[9px] font-bold text-gray-400 truncate max-w-[80px]">{match.awayTeam}</span>
                                                                <div className="flex gap-3">
                                                                    {[1, 2, 3, 4].map(p => (
                                                                        <span key={p} className="w-5 text-center text-[10px] font-black text-white/60">
                                                                            {match.awayScore[`period${p}`] ?? 0}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/match/${match.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/20 rounded-xl transition-all group"
                                                        >
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Análisis IA Completo</span>
                                                            <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
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
