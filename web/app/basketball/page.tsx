"use client";

import { useState, useMemo } from 'react';
import { Trophy, Activity, Calendar, ChevronDown, Zap, Globe, Star, BarChart3, TrendingUp, Target } from 'lucide-react';
import { MatchCardSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import clsx from 'clsx';
import TopLeadersWidget from '@/components/TopLeadersWidget';
import NextToStartWidget from '@/components/NextToStartWidget';
import InjuryTracker from '@/components/InjuryTracker';
import { useQuery } from '@tanstack/react-query';

export default function BasketballHub() {
    const [activeFilter, setActiveFilter] = useState<'live' | 'scheduled'>('live');
    const [expandedTournaments, setExpandedTournaments] = useState<Record<string, boolean>>({});

    const { data: matches = [], isLoading: loading } = useQuery({
        queryKey: ['basketball-matches', activeFilter],
        queryFn: async () => {
            const endpoint = activeFilter === 'live' ? '/api/live/basketball' : '/api/scheduled/basketball';
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Error al cargar partidos de baloncesto');
            const data = await res.json();
            const events = data.events || [];

            // FILTER: Remove finished games from scheduled view
            const filteredEvents = activeFilter === 'scheduled'
                ? events.filter((e: any) => e.status?.type !== 'finished')
                : events;

            return filteredEvents;
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

    const basketballLiveCount = liveCounts['basketball'] || 0;

    const groupEvents = (events: any[]) => {
        if (!events || !Array.isArray(events)) return {};

        return events.reduce((acc: any, event: any) => {
            if (!event) return acc;

            const tournament = event.tournament || {};
            const category = tournament.category || event.category || { name: 'Mundo' };
            let tId = tournament.uniqueId || tournament.id;

            if (!tId) {
                const tName = tournament.name || 'Torneo Desconocido';
                const cName = category.name || 'General';
                tId = `${cName}-${tName}`.replace(/\s+/g, '-').toLowerCase();
            }

            const cleanTournament = {
                ...tournament,
                name: tournament.name || 'Liga Regional',
                id: tId
            };

            if (!acc[tId]) {
                acc[tId] = {
                    info: cleanTournament,
                    category: category,
                    events: []
                };
            }

            acc[tId].events.push(event);
            return acc;
        }, {});
    };

    const groupedEvents = useMemo(() => groupEvents(matches), [matches]);
    const sortedTournamentIds = Object.keys(groupedEvents).sort((a, b) => {
        const nameA = groupedEvents[a].info.name.toLowerCase();
        const nameB = groupedEvents[b].info.name.toLowerCase();
        if (nameA.includes('nba') && !nameB.includes('nba')) return -1;
        if (!nameA.includes('nba') && nameB.includes('nba')) return 1;
        return 0;
    });

    const toggleTournament = (id: any) => {
        setExpandedTournaments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4500] selection:text-black font-sans pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#FF4500]/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-28 px-4 md:px-8 max-w-[100rem] mx-auto space-y-12">

                {/* HERO SECTION - SPANISH */}
                <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-[#0a0a0a] group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-[2s]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

                    <div className="relative z-10 p-10 md:p-20 space-y-8 max-w-4xl">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 backdrop-blur-md">
                            <Activity className="w-4 h-4 text-[#FF4500] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4500]">Inteligencia Baloncesto</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                            VISIÓN DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-orange-400">CANCHA</span> <br />
                            <span className="text-white/20">PRO TERM.</span>
                        </h1>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-[#FF4500]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black italic text-white">NBA</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cobertura Elite</p>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black italic text-white">{basketballLiveCount}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">En Vivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: MATCHES (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit backdrop-blur-md">
                            {[
                                { id: 'live', label: 'EN VIVO', icon: Zap, activeColor: 'bg-[#FF4500] text-black' },
                                { id: 'scheduled', label: 'PROGRAMADOS', icon: Calendar, activeColor: 'bg-white text-black' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id as 'live' | 'scheduled')}
                                    className={clsx(
                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                        activeFilter === tab.id
                                            ? `${tab.activeColor} shadow-lg`
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className={clsx("w-3.5 h-3.5", activeFilter === tab.id && (tab.id === 'live' ? "animate-pulse" : ""))} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Matches Feed */}
                        <div className="space-y-4 min-h-[500px]">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <MatchCardSkeleton key={i} />)
                            ) : matches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-96 bg-white/[0.02] rounded-[3rem] border border-white/5">
                                    <Trophy className="w-16 h-16 text-white/10 mb-4" />
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No hay partidos activos</p>
                                </div>
                            ) : (
                                sortedTournamentIds.map(tournamentId => {
                                    const { info, events } = groupedEvents[tournamentId];
                                    const isExpanded = expandedTournaments[tournamentId] ?? true;
                                    const isNBA = info.name.toLowerCase().includes('nba');

                                    return (
                                        <div key={tournamentId} className={clsx(
                                            "rounded-[2.5rem] overflow-hidden transition-all duration-500 border",
                                            isExpanded ? "bg-[#080808] border-white/10" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                        )}>
                                            <button
                                                onClick={() => toggleTournament(tournamentId)}
                                                className="w-full flex items-center justify-between p-6 md:p-8"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <div className={clsx(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg",
                                                            isNBA ? "bg-[#1D428A] border-[#C8102E]" : "bg-white/5 border-white/10"
                                                        )}>
                                                            {isNBA ? (
                                                                <img src="https://cdn.nba.com/logos/leagues/logo-nba.svg" alt="NBA" className="w-8 h-8 opacity-90" />
                                                            ) : (
                                                                <Trophy className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        {activeFilter === 'live' && (
                                                            <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4500]"></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-left space-y-1">
                                                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">
                                                            {info.name}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Globe className="w-3 h-3" />
                                                            {info.category?.name || 'Internacional'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300",
                                                    isExpanded ? "bg-white text-black rotate-180" : "bg-white/5 text-gray-400"
                                                )}>
                                                    <ChevronDown className="w-5 h-5" />
                                                </div>
                                            </button>

                                            <div className={clsx(
                                                "grid transition-all duration-500 ease-in-out",
                                                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            )}>
                                                <div className="overflow-hidden">
                                                    <div className="p-4 md:p-6 pt-0 space-y-3">
                                                        {events.map((event: any) => (
                                                            <Link
                                                                key={event.id}
                                                                href={`/match/${event.id}`}
                                                                className="block group/match"
                                                            >
                                                                <div className="bg-white/[0.03] hover:bg-[#FF4500]/5 border border-white/5 hover:border-[#FF4500]/30 rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                                                                    {/* HOME TEAM */}
                                                                    <div className="flex-1 flex items-center gap-4">
                                                                        <div className="text-right flex-1">
                                                                            <span className="text-sm md:text-lg font-black italic uppercase text-white group-hover/match:text-[#FF4500] transition-colors">
                                                                                {event.homeTeam.name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="w-12 h-12 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                                                                            <div className="text-[10px] font-black text-gray-600 uppercase">{event.homeTeam.name.substring(0, 3)}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* SCORE / VS */}
                                                                    <div className="px-6 flex flex-col items-center gap-1">
                                                                        {event.status.type === 'inprogress' ? (
                                                                            <>
                                                                                <div className="text-2xl font-black text-white font-mono tracking-widest bg-black/40 px-4 py-1 rounded-lg border border-white/10">
                                                                                    {event.homeScore?.display || 0} - {event.awayScore?.display || 0}
                                                                                </div>
                                                                                <span className="text-[9px] font-bold text-[#FF4500] animate-pulse">Q{event.status.period || 1} • {event.status.displayTime || 'LIVE'}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-xl font-black text-gray-700 italic">VS</span>
                                                                                <span className="text-[9px] font-bold text-gray-500">
                                                                                    {new Date(event.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* AWAY TEAM */}
                                                                    <div className="flex-1 flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                                                                            <div className="text-[10px] font-black text-gray-600 uppercase">{event.awayTeam.name.substring(0, 3)}</div>
                                                                        </div>
                                                                        <div className="text-left flex-1">
                                                                            <span className="text-sm md:text-lg font-black italic uppercase text-white group-hover/match:text-[#FF4500] transition-colors">
                                                                                {event.awayTeam.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: WIDGETS (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* NBA Leaders Widget with new design */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 space-y-6 text-center">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-lg font-black italic uppercase text-white">Mejores Jugadores</h3>
                            </div>
                            <TopLeadersWidget />
                        </div>

                        {/* Next to Start Widget */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 space-y-6 text-center">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-black italic uppercase text-white">Próximamente</h3>
                            </div>
                            <NextToStartWidget sport="basketball" />
                        </div>

                        {/* Injury Tracker */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 space-y-6 text-center">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <h3 className="text-lg font-black italic uppercase text-white">Reporte de Bajas</h3>
                            </div>
                            <InjuryTracker />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
