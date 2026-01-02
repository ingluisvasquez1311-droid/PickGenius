"use client";

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { getTeamLogo } from '@/lib/image-utils';

interface NextToStartWidgetProps {
    sport: 'football' | 'basketball' | 'baseball' | 'nfl' | 'hockey' | 'tennis';
    limit?: number;
}

export default function NextToStartWidget({ sport, limit = 4 }: NextToStartWidgetProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            setLoading(true);
            try {
                // Fetch scheduled matches
                const res = await fetch(`/api/scheduled/${sport}`);
                const data = await res.json();

                if (data.events) {
                    // Sort by startTimestamp to get the nearest ones
                    const sorted = data.events
                        .filter((e: any) => e.startTimestamp > Date.now() / 1000) // Future only
                        .sort((a: any, b: any) => a.startTimestamp - b.startTimestamp)
                        .slice(0, limit);
                    setMatches(sorted);
                }
            } catch (error) {
                console.error("Error fetching next to start:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcoming();
    }, [sport, limit]);

    // Format time (e.g., 14:30)
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="bg-[#090909] border border-white/5 rounded-[2rem] p-6 space-y-4 animate-pulse">
                <div className="h-6 w-32 bg-white/5 rounded-full"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (matches.length === 0) return null;

    return (
        <div className="glass-card border border-white/10 rounded-[2rem] p-6 overflow-hidden relative group hover:cyber-border transition-all duration-500">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-primary/20 to-transparent rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                        <Clock className="w-5 h-5 text-primary animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-black italic uppercase tracking-widest text-white drop-shadow-glow">Próximos</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            Next to Start
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/40 blur-sm rounded-full animate-ping"></div>
                    <span className="relative z-10 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {matches.map((match) => (
                    <Link
                        key={match.id}
                        href={`/match/${match.id}`}
                        className="block group/item relative perspective-[500px]"
                    >
                        <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-primary/40 rounded-2xl p-3 transition-all duration-300 relative overflow-hidden group-hover/item:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] group-hover/item:translate-x-1">

                            {/* Animated Background on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700"></div>

                            <div className="flex items-center justify-between gap-4 relative z-10">
                                {/* Teams */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex -space-x-3 transition-space duration-300 group-hover/item:-space-x-1">
                                        <div className="w-9 h-9 rounded-full bg-[#0a0a0a] border border-white/10 p-1 z-10 shadow-lg group-hover/item:border-primary/50 transition-colors">
                                            <img src={getTeamLogo(match.homeTeam.id)} className="w-full h-full object-contain" alt="" />
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-[#0a0a0a] border border-white/10 p-1 shadow-lg group-hover/item:border-primary/50 transition-colors">
                                            <img src={getTeamLogo(match.awayTeam.id)} className="w-full h-full object-contain" alt="" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black text-white truncate group-hover/item:text-primary transition-colors">{match.homeTeam.shortName || match.homeTeam.name}</span>
                                        <span className="text-[10px] font-bold text-gray-500 truncate group-hover/item:text-gray-300 transition-colors">vs {match.awayTeam.shortName || match.awayTeam.name}</span>
                                    </div>
                                </div>

                                {/* Time & Action */}
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-lg mb-1 border border-white/5 group-hover/item:border-primary/20 transition-colors">
                                        <Clock className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-mono font-black text-white italic">{formatTime(match.startTimestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer */}
            <Link
                href="/props"
                className="group/btn flex items-center justify-center gap-2 w-full mt-6 py-3.5 bg-gradient-to-r from-white/5 to-transparent hover:from-primary/20 hover:to-blue-600/20 text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-primary/30 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">Ver Agenda Completa</span>
                <ChevronRight className="w-3 h-3 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
