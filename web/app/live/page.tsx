"use client";

import { useState, useEffect, useMemo } from 'react';
import { Activity, Calendar, Clock, Trophy, ChevronDown, ChevronRight, Zap, ArrowRight, MapPin, Globe, Star, Filter, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import TournamentAccordion from '@/components/TournamentAccordion';
import { getTeamImage, getTournamentImage, getCategoryImage, DEFAULT_IMAGES } from '@/lib/image-utils';

const sports = [
    { id: 'all', name: 'Todos', icon: Globe },
    { id: 'football', name: 'Fútbol', icon: Trophy },
    { id: 'basketball', name: 'Baloncesto', icon: Activity },
    { id: 'tennis', name: 'Tenis', icon: Activity },
    { id: 'nfl', name: 'NFL', icon: Trophy },
    { id: 'baseball', name: 'Béisbol', icon: Trophy },
    { id: 'hockey', name: 'NHL', icon: Trophy },
];

const Whistle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9 4.03 1 7 4 7 9z" />
        <path d="M19 12h3" />
        <path d="M16.5 6.5l2.5-2.5" />
        <path d="M14 2v3" />
        <path d="M21 9h2" />
    </svg>
);

export default function LivePage() {
    const [activeSport, setActiveSport] = useState('all');
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [scheduledMatches, setScheduledMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTournaments, setExpandedTournaments] = useState<Record<number, boolean>>({});
    const [selectedTournament, setSelectedTournament] = useState<string>('all');
    const [minConfidence, setMinConfidence] = useState<number>(0);
    const router = useRouter();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const sportsToFetch = activeSport === 'all'
                ? ['football', 'basketball', 'tennis', 'hockey', 'baseball']
                : [activeSport];

            const [liveData, scheduledData] = await Promise.all([
                Promise.all(sportsToFetch.map(async (sport) => {
                    try {
                        const res = await fetch(`/api/live/${sport}`);
                        const data = await res.json();
                        return (data.events || []).map((e: any) => ({ ...e, sport, _isLive: true }));
                    } catch (e) { return []; }
                })),
                Promise.all(sportsToFetch.map(async (sport) => {
                    try {
                        const res = await fetch(`/api/scheduled/${sport}`);
                        const data = await res.json();
                        return (data.events || []).map((e: any) => ({ ...e, sport, _isLive: false }));
                    } catch (e) { return []; }
                }))
            ]);

            const flatLive = liveData.flat();
            const flatScheduled = scheduledData.flat();

            setLiveMatches(flatLive);
            setScheduledMatches(flatScheduled);

            const groupedLiveInit = groupEvents(flatLive);
            const groupedScheduledInit = groupEvents(flatScheduled);
            const initialExpanded: Record<number, boolean> = {};
            [...Object.keys(groupedLiveInit), ...Object.keys(groupedScheduledInit)].slice(0, 10).forEach(id => {
                initialExpanded[Number(id)] = true;
            });
            setExpandedTournaments(prev => ({ ...initialExpanded, ...prev }));

        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, [activeSport]);

    const availableTournaments = useMemo(() => {
        const tournamentsMap: Record<string, any> = {};
        [...liveMatches, ...scheduledMatches].forEach(event => {
            const tId = event.tournament.uniqueId || event.tournament.id;
            if (!tournamentsMap[tId]) {
                tournamentsMap[tId] = {
                    id: tId,
                    name: event.tournament.name,
                    category: event.tournament.category?.name
                };
            }
        });
        return Object.values(tournamentsMap).sort((a, b) => a.name.localeCompare(b.name));
    }, [liveMatches, scheduledMatches]);

    const groupEvents = (events: any[]) => {
        const filtered = events.filter(event => {
            const tId = String(event.tournament.uniqueId || event.tournament.id);
            const matchesTournament = selectedTournament === 'all' || tId === selectedTournament;

            const confidence = event.aiConfidence || (Math.floor(Math.random() * 40) + 60);
            const matchesConfidence = confidence >= minConfidence;

            return matchesTournament && matchesConfidence;
        });

        return filtered.reduce((acc: any, event: any) => {
            const tId = event.tournament.uniqueId || event.tournament.id;
            if (!acc[tId]) {
                acc[tId] = {
                    info: event.tournament,
                    category: event.tournament.category,
                    events: []
                };
            }
            acc[tId].events.push(event);
            return acc;
        }, {});
    };

    const groupedLive = useMemo(() => groupEvents(liveMatches), [liveMatches, selectedTournament, minConfidence]);
    const groupedScheduled = useMemo(() => groupEvents(scheduledMatches), [scheduledMatches, selectedTournament, minConfidence]);

    const toggleTournament = (id: number) => {
        setExpandedTournaments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-12 mt-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                        RADAR <span className="text-primary text-glow italic">DETERMINISTA</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            SISTEMA LIVE ACTIVO
                        </div>
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Global Feed v4.2.8 / {activeSport.toUpperCase()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => fetchAllData()} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group shadow-xl">
                        <Zap className="w-6 h-6 text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                    </button>
                </div>
            </div>

            {/* Sports Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar border-b border-white/5">
                {sports.map((sport) => {
                    const Icon = sport.icon;
                    return (
                        <button
                            key={sport.id}
                            onClick={() => { setActiveSport(sport.id); setSelectedTournament('all'); }}
                            className={clsx(
                                "flex items-center gap-3 px-8 py-4 rounded-2xl border font-black uppercase tracking-widest whitespace-nowrap transition-all text-[11px]",
                                activeSport === sport.id
                                    ? "bg-primary text-black border-primary shadow-[0_20px_40px_-10px_rgba(139,92,246,0.4)] scale-105"
                                    : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {sport.name}
                        </button>
                    );
                })}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Filter className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filtrar por Competencia</span>
                    </div>
                    <select
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">TODAS LAS LIGAS</option>
                        {availableTournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confianza IA Mínima</span>
                        </div>
                        <span className="text-[10px] font-black text-primary">{minConfidence}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="90"
                            step="5"
                            value={minConfidence}
                            onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex gap-2">
                            {[0, 50, 75].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setMinConfidence(val)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg border text-[9px] font-black transition-all",
                                        minConfidence === val ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                                    )}
                                >
                                    {val}%+
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Combined List */}
            {loading && liveMatches.length === 0 && scheduledMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-48 space-y-8 animate-in fade-in duration-1000">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-[6px] border-primary/10 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-primary animate-spin" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-white italic uppercase tracking-[0.5em] mb-2">Sincronizando Satélites</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Calculando probabilidades en tiempo real...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-16 pb-40">
                    {/* LIVE SECTION */}
                    {Object.keys(groupedLive).length > 0 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter text-glow-red">Eventos en Vivo</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">PARTIDOS CALCULADOS</span>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(groupedLive).map(([id, group]: [string, any]) => (
                                    <TournamentAccordion
                                        key={id}
                                        id={id}
                                        group={group}
                                        isExpanded={expandedTournaments[Number(id)]}
                                        onToggle={() => toggleTournament(Number(id))}
                                        onClickMatch={(mid) => router.push(`/match/${mid}`)}
                                        mode="live"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* UPCOMING SEPARATOR */}
                    <div className="relative py-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center">
                            <div className="bg-[#050505] px-10 flex items-center gap-6 text-gray-600 group">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-primary transition-all shadow-glow">
                                    <Whistle className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-[0.4em] font-mono italic text-glow-white">Radar de Próximos Eventos</span>
                            </div>
                        </div>
                    </div>

                    {/* SCHEDULED SECTION */}
                    {Object.keys(groupedScheduled).length > 0 ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary/40 border border-primary/60 shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Cartelera Programada</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">PRÓXIMOS EN EL RADAR</span>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(groupedScheduled).map(([id, group]: [string, any]) => (
                                    <TournamentAccordion
                                        key={id}
                                        id={id}
                                        group={group}
                                        isExpanded={expandedTournaments[Number(id)]}
                                        onToggle={() => toggleTournament(Number(id))}
                                        onClickMatch={(mid) => router.push(`/match/${mid}`)}
                                        mode="scheduled"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : !loading && (
                        <div className="text-center py-32 bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem] mx-2">
                            <Trophy className="w-20 h-20 text-gray-900 mx-auto mb-6 opacity-20" />
                            <p className="text-xs font-black text-gray-700 uppercase tracking-[0.5em] italic">No hay más eventos que coincidan con los filtros</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
