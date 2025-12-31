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
        <div className="bg-[#090909] border border-white/5 rounded-[2rem] p-6 overflow-hidden relative group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Próximos</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Next to Start</p>
                    </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {matches.map((match) => (
                    <Link
                        key={match.id}
                        href={`/match/${match.id}`}
                        className="block group/item"
                    >
                        <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-2xl p-3 transition-all duration-300 relative overflow-hidden">
                            <div className="flex items-center justify-between gap-4">
                                {/* Teams */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 p-0.5 z-10">
                                            <img src={getTeamLogo(match.homeTeam.id)} className="w-full h-full object-contain" alt="" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 p-0.5">
                                            <img src={getTeamLogo(match.awayTeam.id)} className="w-full h-full object-contain" alt="" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-white truncate">{match.homeTeam.shortName || match.homeTeam.name}</span>
                                        <span className="text-[10px] text-gray-400 truncate">vs {match.awayTeam.shortName || match.awayTeam.name}</span>
                                    </div>
                                </div>

                                {/* Time & Action */}
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg mb-1">
                                        <Clock className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-mono font-bold text-white">{formatTime(match.startTimestamp)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer */}
            <Link
                href="/props"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-white/5 hover:bg-primary text-gray-400 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
                Ver Agenda Completa
                <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
