"use client";

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Activity, Calendar, ChevronRight, ChevronDown, Star, Target, Zap, ArrowLeft, BarChart3, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import TournamentAccordion from '@/components/TournamentAccordion';
import NextToStartWidget from '@/components/NextToStartWidget';

export default function NFLHub() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'live' | 'scheduled'>('live');
    const [expandedTournaments, setExpandedTournaments] = useState<Record<number, boolean>>({});
    const router = useRouter();

    const fetchCounts = async () => {
        const res = await fetch('/api/live/counts');
        if (!res.ok) return {};
        return await res.json();
    };

    const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchCounts().then(setLiveCounts);
        const interval = setInterval(() => fetchCounts().then(setLiveCounts), 30000);
        return () => clearInterval(interval);
    }, []);

    const nflLiveCount = liveCounts['american-football'] || 0;

    useEffect(() => {
        const fetchNFL = async () => {
            setLoading(true);
            try {
                const endpoint = activeFilter === 'live' ? '/api/live/nfl' : '/api/scheduled/nfl';
                const res = await fetch(endpoint);
                const data = await res.json();
                const events = data.events || [];
                setMatches(events);

                // Auto-expand first 3 tournaments
                const grouped = groupEvents(events);
                const initialExpanded: Record<number, boolean> = {};
                Object.keys(grouped).slice(0, 3).forEach(id => {
                    initialExpanded[Number(id)] = true;
                });
                setExpandedTournaments(initialExpanded);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNFL();
    }, [activeFilter]);

    const groupEvents = (events: any[]) => {
        if (!events || !Array.isArray(events)) return {};
        return events.reduce((acc: any, event: any) => {
            if (!event) return acc;

            // Fallback for missing tournament info
            const tournament = event.tournament || { name: 'Otros Partidos', id: 999999, category: { name: 'Varios' } };
            const tId = tournament.uniqueId || tournament.id || 999999;

            if (!acc[tId]) {
                acc[tId] = {
                    info: tournament,
                    category: tournament.category || { name: 'Mundo' },
                    events: []
                };
            }
            acc[tId].events.push(event);
            return acc;
        }, {});
    };

    const groupedMatches = useMemo(() => groupEvents(matches), [matches]);

    const toggleTournament = (id: number) => {
        setExpandedTournaments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
            {/* Brutalist Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-600/10 blur-[250px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-12">
                {/* Massive Brutalist Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-2 border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="group p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-green-600 transition-all duration-500">
                                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
                            </Link>
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-green-500 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                                Gridiron Data Engine
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] flex flex-col">
                            <span className="text-white">HUB</span>
                            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>NFL PRO</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-1 bg-green-600"></div>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Analítica RedZone y Power Metrics v5.0</p>
                        </div>
                    </div>

                    {/* Industrial Navigation Controls */}
                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <div className="flex flex-wrap gap-4">
                            {/* Live/Scheduled Switcher */}
                            <div className="flex bg-white/[0.02] border-2 border-white/10 p-1.5 rounded-[1.5rem] shadow-inner">
                                <button
                                    onClick={() => setActiveFilter('live')}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all duration-500",
                                        activeFilter === 'live' ? "bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)]" : "text-gray-600 hover:text-white"
                                    )}
                                >
                                    <span className={clsx("w-2 h-2 rounded-full", activeFilter === 'live' ? "bg-white animate-pulse" : "bg-gray-800")}></span>
                                    Live {nflLiveCount > 0 && (
                                        <span className="ml-1.5 px-2 py-0.5 bg-white/20 rounded-md text-[9px]">{nflLiveCount}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveFilter('scheduled')}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all duration-500",
                                        activeFilter === 'scheduled' ? "bg-green-600 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]" : "text-gray-600 hover:text-white"
                                    )}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Kickoff
                                </button>
                            </div>

                            <Link href="/props?sport=nfl" className="group flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-white/10 border-2 border-white/5 rounded-2xl transition-all duration-500">
                                <Zap className="w-5 h-5 text-yellow-500 group-hover:scale-125 transition-transform" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white italic">Field Props</span>
                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                                {activeFilter === 'live' ? 'En el Emparrillado' : 'Calendario Pro'}
                            </h2>
                            <div className="flex-1 h-[2px] bg-gradient-to-r from-white/20 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Grid Tracking Active</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid gap-6">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-32 bg-white/[0.03] border-2 border-dashed border-white/10 rounded-[2.5rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="grid gap-8">
                                {Object.entries(groupedMatches).map(([id, group]: [string, any]) => (
                                    <TournamentAccordion
                                        key={id}
                                        id={id}
                                        group={group}
                                        isExpanded={expandedTournaments[Number(id)]}
                                        onToggle={() => toggleTournament(Number(id))}
                                        onClickMatch={(mid: number) => router.push(`/match/${mid}`)}
                                        mode={activeFilter}
                                        accentColor="green"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                                <div className="p-8 bg-white/5 rounded-full border border-white/10 mb-8">
                                    <Trophy className="w-16 h-16 text-gray-700" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500 mb-2">Campo despejado</h3>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sin partidos detectados en este momento</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Performance */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Court Vision Widget */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080808] border-2 border-white/10 rounded-[3rem] p-10 space-y-6">
                                <NextToStartWidget sport="nfl" />
                                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mt-6">
                                    <div className="p-3 bg-green-600 text-white rounded-2xl shadow-glow-sm">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">REDZONE AI</h3>
                                </div>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                                    Predicción de <span className="text-green-500">Puntos Totales (Over)</span> activada. Debilidad defensiva en zona profunda detectada.
                                </p>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-black text-gray-500">TD Probability</span>
                                        <span className="text-[10px] font-black text-green-500 italic">68% HIGH</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[68%] shadow-glow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tournament Circuits */}
                        <div className="bg-[#080808] border-2 border-white/10 rounded-[3rem] p-10 space-y-8">
                            <h4 className="text-xs font-black uppercase text-gray-500 tracking-[0.4em] border-b border-white/5 pb-4">FOOTBALL CIRCUITS</h4>
                            <div className="grid gap-3">
                                {['NFL Regular', 'NCAAF', 'CFL', 'UFL'].map(comp => (
                                    <div key={comp} className="group flex justify-between items-center p-5 bg-white/5 border border-white/5 hover:border-green-500/40 hover:bg-green-500/5 rounded-2xl transition-all duration-300 cursor-pointer">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{comp}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-green-500 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
