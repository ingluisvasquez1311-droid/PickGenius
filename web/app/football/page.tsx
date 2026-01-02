"use client";

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Activity, Calendar, ChevronRight, ChevronDown, Star, Target, Zap, ArrowLeft, BarChart3 } from 'lucide-react';
import { MatchCardSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import TopLeadersFootballWidget from '@/components/TopLeadersFootballWidget';
import TournamentAccordion from '@/components/TournamentAccordion';
import NextToStartWidget from '@/components/NextToStartWidget';
import InjuryTracker from '@/components/InjuryTracker';

import { useQuery } from '@tanstack/react-query';

export default function FootballHub() {
    const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'leaders'>('matches');
    const [activeFilter, setActiveFilter] = useState<'live' | 'scheduled'>('live');
    const [expandedTournaments, setExpandedTournaments] = useState<Record<number, boolean>>({});
    const router = useRouter();

    const { data: matches = [], isLoading: loading } = useQuery({
        queryKey: ['football-matches', activeFilter],
        queryFn: async () => {
            const endpoint = activeFilter === 'live' ? '/api/live/football' : '/api/scheduled/football';
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Error al cargar partidos de fútbol');
            const data = await res.json();
            return data.events || [];
        },
        staleTime: 30000,
        refetchInterval: activeFilter === 'live' ? 30000 : 0,
    });

    // Global Live Count for all sports
    const { data: liveCounts = {} } = useQuery({
        queryKey: ['live-counts'],
        queryFn: async () => {
            const res = await fetch('/api/live/counts');
            if (!res.ok) return {};
            return await res.json();
        },
        refetchInterval: 30000,
    });

    const footballLiveCount = liveCounts['football'] || 0;

    // Auto-expand first 3 tournaments if none are expanded - moved to useEffect for safety
    useEffect(() => {
        if (matches.length > 0 && Object.keys(expandedTournaments).length === 0) {
            const grouped = groupEvents(matches);
            const initialExpanded: Record<number, boolean> = {};
            Object.keys(grouped).slice(0, 3).forEach(id => {
                initialExpanded[Number(id)] = true;
            });
            setExpandedTournaments(initialExpanded);
        }
    }, [matches]);

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
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/20 blur-[180px] animate-pulse rounded-full opacity-60"></div>
                <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] bg-secondary/15 blur-[200px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-accent/10 blur-[180px] rounded-full opacity-30"></div>
                <div className="absolute inset-0 checkered-bg opacity-[0.05]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.02] mix-blend-overlay"></div>
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-12">
                {/* Massive Brutalist Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-2 border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="group p-4 glass-card rounded-2xl hover:cyber-border transition-all duration-500">
                                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                            </Link>
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                FOOTBALL_ENGINE_V4.0
                            </div>
                        </div>
                        <h1 className="text-7xl md:text-[12rem] font-black italic tracking-tighter uppercase leading-[0.8] flex flex-col">
                            <span className="text-white drop-shadow-[0_0_80px_rgba(255,95,31,0.3)]">HUB</span>
                            <span className="gradient-text">FÚTBOL</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent"></div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">Sistema Ultra-Fidelidad</p>
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
                                    Live {footballLiveCount > 0 && (
                                        <span className="ml-1.5 px-2 py-0.5 bg-black/20 rounded-md text-[10px] font-mono">{footballLiveCount}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveFilter('scheduled')}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all duration-500",
                                        activeFilter === 'scheduled' ? "bg-primary text-black shadow-[0_0_25px_rgba(139,92,246,0.4)]" : "text-gray-600 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Agenda
                                </button>
                            </div>

                            <Link href="/props?sport=football" className="group flex items-center gap-4 px-8 py-4 glass-card hover:cyber-border rounded-2xl transition-all duration-500">
                                <Zap className="w-5 h-5 text-yellow-500 group-hover:scale-125 group-hover:rotate-12 transition-all animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary italic">Elite Props</span>
                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Ultra-Premium Tabs */}
                        <div className="flex w-full items-stretch h-14 glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            {[
                                { id: 'matches', label: 'CAMPO', icon: Activity },
                                { id: 'standings', label: 'TABLAS', icon: Trophy },
                                { id: 'leaders', label: 'ÉLITE', icon: Target }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "flex-1 px-6 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all duration-500 relative group",
                                        activeTab === tab.id ? "bg-gradient-to-r from-primary to-secondary text-black shadow-[0_0_20px_rgba(124,58,237,0.4)]" : "text-gray-500 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <tab.icon className={clsx("w-4 h-4 transition-transform", activeTab === tab.id ? "text-black scale-110" : "text-gray-600 group-hover:scale-105")} />
                                    <span className="relative z-10">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-8 space-y-10">
                        {activeTab === 'matches' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-700">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Misión <span className="text-primary">Estratégica</span></h2>
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-white/20 to-transparent"></div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Engine Ready</span>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="grid gap-8">
                                        {[1, 2, 3, 4].map((i) => (
                                            <MatchCardSkeleton key={i} />
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
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                                        <div className="p-8 bg-white/5 rounded-full border border-white/10 mb-8">
                                            <Activity className="w-16 h-16 text-gray-700" />
                                        </div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500 mb-2">Sin actividad detectada</h3>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">El radar está limpio en este cuadrante</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'standings' && (
                            <div className="bg-[#080808] border-2 border-white/10 p-12 rounded-[3.5rem] relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Trophy className="w-48 h-48 text-primary" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <h3 className="text-5xl font-black uppercase italic tracking-tighter">TABLAS <span className="text-primary">MUNDIALES</span></h3>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-xl leading-relaxed">
                                        Acceso directo a la jerarquía de las ligas de élite. Sincronización en tiempo real con bases de datos globales.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                                        {['Premier League', 'LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions'].map(league => (
                                            <div key={league} className="group p-8 bg-white/5 border-2 border-white/5 hover:border-primary/40 hover:bg-primary/5 rounded-[2rem] transition-all duration-500 cursor-pointer">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-2 group-hover:bg-primary transition-colors">
                                                        <Star className="w-full h-full text-gray-500 group-hover:text-black" />
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white">{league}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'leaders' && (
                            <div className="animate-in fade-in zoom-in-95 duration-700">
                                <TopLeadersFootballWidget />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Performance */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080808] border-2 border-white/10 rounded-[3rem] p-8">
                                <NextToStartWidget sport="football" />
                                <div className="mt-8">
                                    <InjuryTracker sport="football" />
                                </div>
                            </div>
                        </div>

                        {/* System Info Brutalist */}
                        <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] p-10 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                                <span>Status</span>
                                <span className="text-green-500">Online</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[88%] shadow-glow-sm"></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                    <span>AI Efficiency</span>
                                    <span className="text-primary italic">88.4%</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                                Motor de procesamiento activo. Datos sincronizados vía Sofascore Global.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
