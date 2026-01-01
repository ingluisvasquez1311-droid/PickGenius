"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, Activity, Zap, Users, Info,
    TrendingUp, Trophy, ArrowLeft, Crown, Lock, Clock,
    Shield, Flag, Target, ArrowRight,
    Diamond, Search, Sparkles, ShieldAlert, History
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import LiveGameClock from '@/components/LiveGameClock'; // Componente de reloj en vivo
import Image from 'next/image';
import clsx from 'clsx';
import AIConfidenceMeter from '@/components/AIConfidenceMeter';
import KellyCalculator from '@/components/KellyCalculator';
import WinProbabilityChart from '@/components/WinProbabilityChart';
import SocialFeed from '@/components/SocialFeed';
import { AnalysisSkeleton, MatchCardSkeleton, Skeleton } from '@/components/Skeleton';
import { getTeamImage, getTournamentImage, getCategoryImage, getPlayerImage, getBlurDataURL } from '@/lib/image-utils';

// Translation Helper
const translateStat = (name: string) => {
    const dictionary: Record<string, string> = {
        // General
        "Ball possession": "Posesión",
        "Fouls": "Faltas",

        // Fútbol
        "Total shots": "Tiros Totales",
        "Shots on target": "Tiros al Arco",
        "Shots off target": "Tiros Fuera",
        "Corner kicks": "Córners",
        "Offsides": "Fueras de Juego",
        "Yellow cards": "Tarjetas Amarillas",
        "Red cards": "Tarjetas Rojas",
        "Goalkeeper saves": "Atajadas",
        "Passes": "Pases",
        "Tackles": "Entradas",
        "Big chances": "Oportunidades Claras",

        // Baloncesto
        "Free throws": "Tiros Libres",
        "2 pointers": "Dobles",
        "3 pointers": "Triples",
        "Rebounds": "Rebotes",
        "Assists": "Asistencias",
        "Turnovers": "Pérdidas",
        "Steals": "Robos",
        "Blocks": "Bloqueos",
        "Timeouts": "Tiempos Muertos",

        // Tenis
        "Aces": "Aces",
        "Double faults": "Dobles Faltas",
        "First serve points": "Puntos 1er Servicio",
        "Second serve points": "Puntos 2do Servicio",
        "Break points": "Puntos de Quiebre",
        "Service games": "Juegos de Servicio",
        "Return games": "Juegos de Resto",

        // Béisbol / NFL
        "Hits": "Hits",
        "Errors": "Errores",
        "Home runs": "Home Runs",
        "Strikeouts": "Ponches",
        "Yards": "Yardas",
        "Touchdowns": "Touchdowns",
        "Interceptions": "Intercepciones",
        "Sacks": "Capturas",
        "Penalties": "Penalizaciones",

        // Hockey (NHL)
        "Shots on goal": "Tiros al Arco",
        "Saves": "Atajadas",
        "Power plays": "Power Plays",
        "PIM": "Minutos de Penalización",
        "Faceoffs won": "Faceoffs Ganados",

        // Best Players Categories
        "points": "Puntos",
        "rebounds": "Rebotes",
        "assists": "Asistencias",
        "goals": "Goles",
        "rating": "Calificación",
        "steals": "Robos",
        "blocks": "Bloqueos",
        "strikeouts": "Ponches",
        "yards": "Yardas",
        "passingYards": "Yardas de Pase",
        "rushingYards": "Yardas de Carrera",
        "receivingYards": "Yardas de Recepción",
        "tackles": "Tackleos",
        "homeRuns": "Home Runs",
        "era": "ERA"
    };
    return dictionary[name] || name;
};

import { useQuery } from '@tanstack/react-query';

export default function MatchDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiConfidence, setAiConfidence] = useState<number | null>(null);
    const { user, isLoaded: authLoaded } = useUser();
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isGold = user?.publicMetadata?.isGold === true || user?.publicMetadata?.role === 'admin';

    const { data, isLoading: loading } = useQuery({
        queryKey: ['match', id],
        queryFn: async () => {
            const res = await fetch(`/api/match/${id}`);
            if (!res.ok) throw new Error('Error al cargar datos del partido');
            return res.json();
        },
        refetchInterval: (query: any) => {
            const status = query.state.data?.event?.status?.type;
            return status === 'inprogress' ? 30000 : 0;
        },
        enabled: !!id,
    });

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/checkout/session', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error('Upgrade error:', e);
        } finally {
            setIsUpgrading(false);
        }
    };

    const generateAnalysis = async () => {
        if (!data || !data.event) return;
        setAnalyzing(true);

        const isLive = data.event.status.type === 'inprogress';
        const isScheduled = data.event.status.type === 'notstarted';

        // Format Lineups for Context
        const homeLineup = data.lineups?.home?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const awayLineup = data.lineups?.away?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const lineupsContext = `Alineación Local: ${homeLineup}\nAlineación Visitante: ${awayLineup}`;

        // Detect Sport for Context-Aware Prompts
        const sportSlug = data.sport?.slug || data.event.sport?.slug || '';
        const tournamentName = data.event.tournament?.name?.toLowerCase() || '';
        const categoryName = data.event.tournament?.category?.name?.toLowerCase() || '';

        const isBasketball = sportSlug.includes('basketball') || sportSlug.includes('basket') ||
            tournamentName.includes('nba') || tournamentName.includes('basket') ||
            categoryName.includes('basketball');

        const isNFL = sportSlug.includes('american-football') || sportSlug.includes('nfl') ||
            tournamentName.includes('nfl') || tournamentName.includes('super bowl');

        const isTennis = sportSlug.includes('tennis') ||
            tournamentName.includes('atp') || tournamentName.includes('wta') ||
            tournamentName.includes('itf') || tournamentName.includes('challenger');

        const isFootball = !isBasketball && !isTennis && !isNFL; // Soccer

        // NEW: Deep Analytics Context (H2H & Incidents)
        const h2hSummary = data.h2h?.teamStats ?
            `H2H Histórico: Local ${data.h2h.teamStats.homeWins}V - Empates ${data.h2h.teamStats.draws} - Visitante ${data.h2h.teamStats.awayWins}V` : "";
        const injuryContext = data.incidents?.filter((inc: any) => inc.incidentType === 'injury' || inc.incidentClass === 'injury').length > 0 ?
            `Reportes de Lesiones/Ausencias Recientes: Detectados` : "Sin incidencias graves reportadas.";

        const deepContext = `\n--- DEEP ANALYTICS ---\n${h2hSummary}\n${injuryContext}\n`;

        let prompt = "";

        if (isLive) {
            prompt = `Analiza este partido de ${isBasketball ? 'BALONCESTO' : isNFL ? 'FÚTBOL AMERICANO' : isTennis ? 'TENIS' : 'FÚTBOL'} EN VIVO (Motor v2.5 - Deep Analytics):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Liga/País: ${data.event.tournament.name} (${data.event.tournament.category?.name})
            Marcador: ${data.event.homeScore?.current ?? 0} - ${data.event.awayScore?.current ?? 0}
            Tiempo: ${data.event.status.description}
            Estadísticas Clave: ${JSON.stringify(data.statistics?.[0]?.groups || [])}
            ${lineupsContext}
            ${deepContext}
            
            REQUISITOS OBLIGATORIOS POR DEPORTE:
            ${isBasketball ? `
            - ANALIZA: Ritmo de anotación (Pace) + Impacto H2H.
            - PROPS: Analiza rebotes y puntos basándote en el matchup defensivo y ausencias.
            ` : isNFL ? `
            - ANALIZA: Juego terrestre vs aéreo basándote en lesiones de la secundaria/línea.
            - TOUCHDOWNS: Probabilidad de anotación en zona roja.
            ` : isTennis ? `
            - ANALIZA: Porcentaje de primer servicio y breaks.
            ` : `
            - ANALIZA: xG real basado en ataques peligrosos + consistencia H2H.
            - CÓRNERS: ¿El equipo que pierde está presionando lo suficiente?
            `}
            
            DAME:
            1. Un pick de valor "PREMIUM" (Probabilidad > 75%).
            2. Análisis táctico profundo en 3 puntos clave (incluye H2H/Lesiones).
            3. Proyección final del marcador.`;

        } else if (isScheduled) {
            prompt = `Analiza este partido de ${isBasketball ? 'BALONCESTO' : isNFL ? 'FÚTBOL AMERICANO' : isTennis ? 'TENIS' : 'FÚTBOL'} PRÓXIMO (Motor v2.5 - Deep Analytics):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Liga/País: ${data.event.tournament.name} (${data.event.tournament.category?.name})
            ${lineupsContext}
            ${deepContext}
            
            REQUISITOS DE ANÁLISIS POR DEPORTE:
            ${isBasketball ? `
            - H2H & PACE: ¿Cómo afecta la historia reciente al ritmo de hoy?
            - PLAYER PROPS: Proyecciones basadas en enfrentamientos directos previos.
            ` : isNFL ? `
            - MATCHUP: Duel de QB vs Secundaria + Impacto de lesiones reportadas.
            ` : `
            - FORMA RECIENTE + H2H: ¿Es el local "padre" histórico del visitante?
            - VALUE: ¿Las cuotas ignoran una ausencia clave o tendencia H2H?
            `}
            
            DAME:
            1. Predicción del Ganador y Marcador Exacto más probable.
            2. Top 3 Oportunidades de "Props" o mercados secundarios.
            3. Índice de Confianza (0-100%).`;
        } else {
            prompt = `Analiza el resultado final (Post-Match v2.0):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Resultado: ${data.event.homeScore?.current ?? 0} - ${data.event.awayScore?.current ?? 0}
            ${lineupsContext}
            MVP Stats: ${JSON.stringify(data.bestPlayers || {})}
            
            ¿Fue el resultado coherente con las alineaciones presentadas? ¿Qué factor táctico decidió el juego?`;
        }

        try {
            const res = await fetch('/api/groq', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            const content = json.content;

            // Extract confidence if present [CONFIDENCE: XX]
            const confMatch = content.match(/\[CONFIDENCE:\s*(\d+)\]/i);
            if (confMatch) {
                setAiConfidence(parseInt(confMatch[1]));
                setAiAnalysis(content.replace(/\[CONFIDENCE:\s*\d+\]/i, '').trim());
            } else {
                setAiAnalysis(content);
            }
        } catch (e) {
            console.error(e);
            setAiAnalysis("Error conectando con la IA. Intenta de nuevo.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-gray-400">
                <ArrowLeft className="w-5 h-5" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="h-[400px] w-full bg-white/5 rounded-[2rem] animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <MatchCardSkeleton />
                </div>
                <AnalysisSkeleton />
            </div>
        </div>
    );

    if (!data || !data.event) return (
        <div className="min-h-screen flex justify-center items-center text-white">
            Partido no encontrado o finalizado.
        </div>
    );

    const { event, statistics } = data;
    const periodStats = statistics?.[0]?.groups || []; // Usually period "ALL" or "1st Half"

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver
            </button>

            {/* Scoreboard Header */}
            <div className="glass-card p-0 overflow-hidden rounded-[2rem] border-white/5 shadow-2xl shadow-primary/10">
                <div className="bg-gradient-to-br from-primary/20 via-transparent to-accent/5 p-8 md:p-12 text-center space-y-10 relative overflow-hidden">

                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                    <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                            <Image
                                src={getCategoryImage(event.tournament.category.id)}
                                className="w-5 h-5 rounded-full object-cover"
                                alt=""
                                width={20}
                                height={20}
                                placeholder="blur"
                                blurDataURL={getBlurDataURL()}
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{event.tournament.category.name}</span>
                            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{event.tournament.name}</span>
                        </div>

                        <div className="px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="flex flex-col items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black animate-pulse flex items-center gap-1.5 border border-red-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    LIVE
                                </div>
                                <span className="text-sm font-mono text-primary font-black tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {/* Dynamic Game Time Logic */}
                                    {(() => {
                                        // 1. Try explicit time
                                        if (event.status?.time) return event.status.time;

                                        // 2. Calculate from timestamp
                                        if (event.time?.currentPeriodStartTimestamp) {
                                            const start = event.time.currentPeriodStartTimestamp * 1000;
                                            const now = Date.now();
                                            const diff = Math.floor((now - start) / 60000);

                                            // Base time determination
                                            let base = 0;
                                            const desc = event.status?.description || '';
                                            if (desc.includes('2nd') || desc.includes('2T')) base = 45;
                                            if (desc.includes('3rd') || desc.includes('3T')) base = 0;
                                            if (desc.includes('4th') || desc.includes('4T')) base = 0;

                                            const calculated = base + diff;
                                            return `${calculated > 0 ? calculated : 0}'`;
                                        }

                                        // 3. Fallback to description or default
                                        return event.status?.description || 'EN VIVO';
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center max-w-4xl mx-auto relative z-10 px-4 md:px-0">
                        {/* Home */}
                        <div className="flex flex-col items-center gap-4 md:gap-6 w-1/3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all opacity-0 group-hover:opacity-100"></div>
                                <Image
                                    src={getTeamImage(event.homeTeam.id)}
                                    className="w-16 h-16 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform"
                                    alt={event.homeTeam.name}
                                    width={128}
                                    height={128}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-sm md:text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-2 md:line-clamp-none">{event.homeTeam.name}</h2>
                                <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">Local</p>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center gap-4 md:gap-6 flex-1 px-4">
                            <div className="text-4xl md:text-9xl font-black text-white font-mono flex items-center gap-2 md:gap-8 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                <span>{event.homeScore?.current ?? 0}</span>
                                <span className="text-white/10 text-2xl md:text-6xl animate-pulse">:</span>
                                <span>{event.awayScore?.current ?? 0}</span>
                            </div>

                            {/* Period Breakdown - Cleaner Look */}
                            <div className="flex gap-2 md:gap-8 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                {[1, 2, 3, 4, 5].map(p => {
                                    const h = event.homeScore?.[`period${p}`];
                                    const a = event.awayScore?.[`period${p}`];
                                    if (h === undefined && a === undefined) return null;
                                    return (
                                        <div key={p} className="flex flex-col items-center gap-0.5">
                                            <span className="text-[7px] font-black text-gray-600 uppercase">P{p}</span>
                                            <div className="flex flex-col font-mono text-[10px] md:text-xs font-bold gap-0.5 min-w-[1.5rem]">
                                                <span className="text-white">{h ?? '-'}</span>
                                                <span className="text-gray-400 border-t border-white/5">{a ?? '-'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {event.status.type === 'inprogress' && (
                                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                                    <div className="text-red-500 font-mono text-[10px] md:text-sm font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                        <span>LIVE</span>
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        <LiveGameClock
                                            startTimestamp={event.time?.currentPeriodStartTimestamp}
                                            statusDescription={event.status.description}
                                            statusType={event.status.type}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Away */}
                        <div className="flex flex-col items-center gap-4 md:gap-6 w-1/3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"></div>
                                <Image
                                    src={getTeamImage(event.awayTeam.id)}
                                    className="w-16 h-16 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform"
                                    alt={event.awayTeam.name}
                                    width={128}
                                    height={128}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-sm md:text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-2 md:line-clamp-none">{event.awayTeam.name}</h2>
                                <p className="text-[8px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Visitante</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Tools Grid - Balanced and Professional */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (8 units) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-6 rounded-[2rem] border-white/5">
                            <WinProbabilityChart
                                incidents={data.incidents}
                                homeTeam={data.event.homeTeam.name}
                                awayTeam={data.event.awayTeam.name}
                                currentStatus={data.event.status.type}
                            />
                        </div>
                        <div className="glass-card p-4 rounded-[2rem] border-white/5 max-h-[500px] overflow-hidden flex flex-col">
                            <SocialFeed matchId={id as string} />
                        </div>
                    </div>

                    {/* Community Voting Section (Integrated Real Data) */}
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-8 bg-gradient-to-r from-primary/10 via-transparent to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="w-32 h-32 text-white" />
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase italic tracking-tighter text-2xl">Nación PickGenius</h3>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sentimiento Global Sofascore</p>
                                </div>
                            </div>
                            <div className="text-center md:text-right px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-3xl font-mono font-black text-white">
                                    {((data.votes?.vote1 || 0) + (data.votes?.voteX || 0) + (data.votes?.vote2 || 0)).toLocaleString()}
                                </span>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Votantes Globales</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {(() => {
                                const v1 = data.votes?.vote1 || 0;
                                const vX = data.votes?.voteX || 0;
                                const v2 = data.votes?.vote2 || 0;
                                const total = v1 + vX + v2 || 1;
                                const p1 = Math.round((v1 / total) * 100);
                                const pX = Math.round((vX / total) * 100);
                                const p2 = Math.round((v2 / total) * 100);

                                return (
                                    <>
                                        <div className="flex justify-between items-end px-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{event.homeTeam.name}</span>
                                                <span className="text-2xl font-black text-white italic">{p1}%</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Empate</span>
                                                <span className="text-xl font-black text-gray-400 italic">{pX}%</span>
                                            </div>
                                            <div className="flex flex-col items-right text-right">
                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{event.awayTeam.name}</span>
                                                <span className="text-2xl font-black text-white italic">{p2}%</span>
                                            </div>
                                        </div>

                                        <div className="h-6 bg-white/5 rounded-full overflow-hidden flex p-1 border border-white/10 shadow-inner">
                                            {/* Home Bar */}
                                            <div
                                                className="h-full bg-primary rounded-l-full relative group transition-all duration-1000 ease-out"
                                                style={{ width: `${p1}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            {/* Draw Bar */}
                                            <div
                                                className="h-full bg-white/10 relative group transition-all duration-1000 ease-out"
                                                style={{ width: `${pX}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            {/* Away Bar */}
                                            <div
                                                className="h-full bg-white/40 rounded-r-full relative group transition-all duration-1000 ease-out"
                                                style={{ width: `${p2}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="flex items-center gap-3 justify-center text-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                                    Datos comunitarios verificados en tiempo real vía <span className="text-white font-black">Sofascore Intelligence</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 units) - AI & Stats Stack */}
                <div className="lg:col-span-4 space-y-8">
                    {/* AI Analysis Section */}
                    <div className="glass-card p-6 rounded-[2rem] space-y-6 border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                <h3 className="font-black text-white uppercase tracking-tighter text-xl italic">
                                    {data.event.status.type === 'notstarted' ? 'Predicción IA' : 'Análisis IA'}
                                </h3>
                            </div>
                            {aiConfidence !== null && (
                                <AIConfidenceMeter confidence={aiConfidence} size="sm" showLabel={false} />
                            )}
                        </div>

                        <div className="relative z-10">
                            {!aiAnalysis ? (
                                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-center space-y-4">
                                    <p className="text-gray-400 italic text-[11px] uppercase tracking-wider font-bold">
                                        {data.event.status.type === 'notstarted'
                                            ? "Solicita el radar predictivo"
                                            : "Analizador táctico offline"}
                                    </p>
                                    <button
                                        onClick={generateAnalysis}
                                        disabled={analyzing}
                                        className="w-full bg-primary text-black font-black uppercase text-[10px] px-6 py-4 rounded-xl hover:bg-white transition-all shadow-glow disabled:opacity-50"
                                    >
                                        {analyzing ? "Procesando..." : "ACTIVAR IA"}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group/analysis">
                                    <div className={clsx(
                                        "bg-black/40 p-5 rounded-2xl border border-white/5 transition-all duration-700",
                                        !isGold && "blur-md select-none pointer-events-none opacity-40 max-h-40 overflow-hidden"
                                    )}>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <div className="whitespace-pre-wrap text-[13px] text-gray-300 leading-relaxed font-medium">
                                                {aiAnalysis}
                                            </div>
                                        </div>
                                    </div>

                                    {!isGold && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
                                                <Lock className="w-6 h-6 text-black" />
                                            </div>
                                            <h4 className="text-sm font-black text-white italic uppercase mb-1">Elite Locked</h4>
                                            <button
                                                onClick={handleUpgrade}
                                                className="text-primary font-black uppercase text-[9px] tracking-widest hover:underline"
                                            >
                                                Desbloquear con Gold
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="glass-card p-6 rounded-[2rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <Activity className="w-5 h-5 text-gray-400" />
                            <h3 className="font-black text-white uppercase tracking-tighter text-xl italic">Estadísticas</h3>
                        </div>

                        {!periodStats.length ? (
                            <div className="text-center text-gray-600 py-8 text-xs font-black uppercase tracking-widest">
                                Sin datos detallados
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {periodStats.slice(0, 1).map((group: any) => (
                                    <div key={group.groupName} className="space-y-3">
                                        {group.statisticsItems.slice(0, 8).map((item: any, i: number) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                                    <span>{item.home}</span>
                                                    <span className="text-white">{translateStat(item.name)}</span>
                                                    <span>{item.away}</span>
                                                </div>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(parseFloat(item.home) / (parseFloat(item.home) + parseFloat(item.away) || 1)) * 100}%` }}
                                                    ></div>
                                                    <div className="flex-1 bg-white/20"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lineups (Alineaciones) */}
            {data.lineups && (data.lineups.home?.players?.length > 0 || data.lineups.away?.players?.length > 0) && (
                <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/5 space-y-10">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-primary" />
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Alineaciones</h3>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-3">Confirmación Táctica</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                        {/* Home Lineup */}
                        <div className="space-y-8">
                            <h4 className="text-lg font-black text-white border-b border-primary/30 pb-4 uppercase italic flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-primary shadow-glow-sm"></span>
                                {event.homeTeam.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.lineups.home.players.filter((p: any) => !p.substitute).map((p: any) => (
                                    <div key={p.player.id} className="flex items-center gap-3 group bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 shadow-lg">
                                            <Image
                                                src={getPlayerImage(p.player.id)}
                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                                                alt=""
                                                width={40}
                                                height={40}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[11px] font-black text-white truncate group-hover:text-primary transition-colors uppercase">{p.player.name}</p>
                                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">#{p.shirtNumber} | {p.position}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Away Lineup */}
                        <div className="space-y-8">
                            <h4 className="text-lg font-black text-white border-b border-white/20 pb-4 uppercase italic flex items-center justify-end gap-3 text-right">
                                {event.awayTeam.name}
                                <span className="w-3 h-3 rounded-full bg-white/40"></span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.lineups.away.players.filter((p: any) => !p.substitute).map((p: any) => (
                                    <div key={p.player.id} className="flex items-center gap-3 group flex-row-reverse text-right bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 shadow-lg">
                                            <Image
                                                src={getPlayerImage(p.player.id)}
                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                                                alt=""
                                                width={40}
                                                height={40}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[11px] font-black text-white truncate group-hover:text-primary transition-colors uppercase">{p.player.name}</p>
                                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">#{p.shirtNumber} | {p.position}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Best Players Section */}
            {data.bestPlayers && Object.keys(data.bestPlayers).length > 0 && (
                <div className="glass-card p-10 md:p-16 rounded-[3rem] border-white/5 space-y-12 bg-white/[0.01] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Trophy className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Mejores jugadores</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Líderes de Escuadra</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(data.bestPlayers).map(([category, players]: [string, any]) => (
                            <div key={category} className="space-y-6 bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group/card">
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full">{translateStat(category)}</span>
                                </div>

                                <div className="space-y-4">
                                    {(players as any[]).map((entry, idx) => (
                                        <div key={idx} className={clsx(
                                            "flex items-center gap-3 group/player",
                                            entry.team?.id === event.awayTeam.id ? "flex-row-reverse text-right" : "text-left"
                                        )}>
                                            <div className="relative shrink-0">
                                                <Image
                                                    src={getPlayerImage(entry.player.id)}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/10 bg-black relative z-10 group-hover/player:border-primary/50 transition-colors"
                                                    alt={entry.player.name}
                                                    width={40}
                                                    height={40}
                                                    placeholder="blur"
                                                    blurDataURL={getBlurDataURL()}
                                                />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className={clsx(
                                                    "flex items-baseline gap-1.5",
                                                    entry.team?.id === event.awayTeam.id ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    <span className="text-xl font-black text-white font-mono leading-none">{entry.value}</span>
                                                    <p className="text-[9px] font-black text-gray-400 truncate uppercase tracking-tighter">{entry.player.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
