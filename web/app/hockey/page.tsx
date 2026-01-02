"use client";

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Activity, Calendar, ChevronRight, ChevronDown, Star, Target, Zap, ArrowLeft, BarChart3, Snowflake, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import TournamentAccordion from '@/components/TournamentAccordion';
import NextToStartWidget from '@/components/NextToStartWidget';

export default function HockeyHub() {
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

    const hockeyLiveCount = liveCounts['hockey'] || 0;

    useEffect(() => {
        const fetchHockey = async () => {
            setLoading(true);
            try {
                const endpoint = activeFilter === 'live' ? '/api/live/hockey' : '/api/scheduled/hockey';
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
        fetchHockey();
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
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
            {/* Cyber-Glass Ambient Layers */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-sky-500/20 blur-[180px] animate-pulse rounded-full opacity-60"></div>
                <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] bg-cyan-400/15 blur-[200px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-blue-400/10 blur-[180px] rounded-full opacity-30"></div>
                <div className="absolute inset-0 checkered-bg opacity-[0.05]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.02] mix-blend-overlay"></div>
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-12">
                {/* Massive Brutalist Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-2 border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="group p-4 glass-card rounded-2xl hover:cyber-border transition-all duration-500">
                                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
                            </Link>
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                </span>
                                ICE_ENGINE_V2.1
                            </div>
                        </div>
                        <h1 className="text-7xl md:text-[12rem] font-black italic tracking-tighter uppercase leading-[0.8] flex flex-col">
                            <span className="text-white drop-shadow-[0_0_80px_rgba(34,211,238,0.3)]">HUB</span>
                            <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #22d3ee 10%, #0ea5e9 50%, #bae6fd 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'var(--animate-gradient-shift)' }}>NHL ICE</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="h-px w-24 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">Analítica de Impacto y Power Play</p>
                        </div>
                    </div>

                    {/* Cyber Navigation Controls */}
                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <div className="flex flex-wrap gap-4">
                            {/* Live/Scheduled Switcher - Cyber Style */}
                            <div className="flex glass-card p-1.5 rounded-[1.5rem] border border-white/10">
                                <button
                                    onClick={() => setActiveFilter('live')}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all duration-500",
                                        activeFilter === 'live' ? "cyber-button text-black shadow-[0_0_25px_rgba(255,95,31,0.4)]" : "text-gray-600 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <span className={clsx("w-2 h-2 rounded-full", activeFilter === 'live' ? "bg-black animate-pulse shadow-[0_0_10px_black]" : "bg-gray-700")}></span>
                                    Live {hockeyLiveCount > 0 && (
                                        <span className="ml-1.5 px-2 py-0.5 bg-black/20 rounded-md text-[10px] font-mono">{hockeyLiveCount}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveFilter('scheduled')}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all duration-500",
                                        activeFilter === 'scheduled' ? "bg-cyan-500 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)]" : "text-gray-600 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Puck Drop
                                </button>
                            </div>

                            <Link href="/props?sport=hockey" className="group flex items-center gap-4 px-8 py-4 glass-card hover:cyber-border rounded-2xl transition-all duration-500">
                                <Zap className="w-5 h-5 text-yellow-500 group-hover:scale-125 group-hover:rotate-12 transition-all animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-cyan-400 italic">Elite Props</span>
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
                                {activeFilter === 'live' ? 'En el Hielo' : 'Temporada Regular'}
                            </h2>
                            <div className="flex-1 h-[2px] bg-gradient-to-r from-white/20 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Puck Tracking Active</span>
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
                                        accentColor="sky"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                                <div className="p-8 bg-white/5 rounded-full border border-white/10 mb-8">
                                    <Snowflake className="w-16 h-16 text-gray-700" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500 mb-2">Hielo despejado</h3>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sin partidos detectados en este momento</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Performance */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Court Vision Widget */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-blue-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080808] border-2 border-white/10 rounded-[3rem] p-10 space-y-6">
                                <NextToStartWidget sport="hockey" />
                                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mt-6">
                                    <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-glow-sm">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">RASTREADOR IA</h3>
                                </div>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                                    Alta probabilidad de <span className="text-sky-400">Goles en Power Play</span> hoy. Los porteros locales muestran fatiga.
                                </p>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-black text-gray-500">Over 5.5 Probability</span>
                                        <span className="text-[10px] font-black text-sky-400 italic">72% HIGH</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-400 w-[72%] shadow-glow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tournament Circuits */}
                        <div className="bg-[#080808] border-2 border-white/10 rounded-[3rem] p-10 space-y-8">
                            <h4 className="text-xs font-black uppercase text-gray-500 tracking-[0.4em] border-b border-white/5 pb-4">COLD CIRCUITS</h4>
                            <div className="grid gap-3">
                                {['NHL', 'KHL', 'SHL', 'Liiga'].map(comp => (
                                    <div key={comp} className="group flex justify-between items-center p-5 bg-white/5 border border-white/5 hover:border-sky-500/40 hover:bg-sky-500/5 rounded-2xl transition-all duration-300 cursor-pointer">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{comp}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-sky-500 transition-all" />
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
