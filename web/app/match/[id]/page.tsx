"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, Activity, Zap, Users, Info,
    TrendingUp, Trophy, ArrowLeft, Crown, Lock, Clock,
    Shield, Flag, Target, ArrowRight,
    Diamond, Search, Sparkles, ShieldAlert, History, MapPin, Calendar, Flame
} from 'lucide-react';
import { useUser } from '@/components/ClerkSafeProvider';
import Link from 'next/link';
import LiveGameClock from '@/components/LiveGameClock';
import Image from 'next/image';
import clsx from 'clsx';
import AIConfidenceMeter from '@/components/AIConfidenceMeter';
import KellyCalculator from '@/components/KellyCalculator';
import WinProbabilityChart from '@/components/WinProbabilityChart';
import SocialFeed from '@/components/SocialFeed';
import { AnalysisSkeleton, MatchCardSkeleton, Skeleton } from '@/components/Skeleton';
import { getTeamImage, getTournamentImage, getCategoryImage, getPlayerImage, getBlurDataURL } from '@/lib/image-utils';
import { PremiumProjectionCard, SportType } from '@/components/PremiumProjectionCard';
import { PlayerModal } from '@/components/PlayerModal'; // Import Modal
import { useQuery } from '@tanstack/react-query';

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

export default function MatchDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiConfidence, setAiConfidence] = useState<number | null>(null);
    const [projections, setProjections] = useState<any>({});
    const { user, isLoaded: authLoaded } = useUser();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // New state for player modal

    const isAuthorizedAdmin = user?.emailAddresses[0]?.emailAddress === 'luisvasquez1311@gmail.com';
    const isGold = user?.publicMetadata?.isGold === true || user?.publicMetadata?.role === 'admin' || isAuthorizedAdmin;

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

    // Detect Sport for Context-Aware Prompts & UI
    const sportSlug = data?.sport?.slug || data?.event?.sport?.slug || '';
    const tournamentName = data?.event?.tournament?.name?.toLowerCase() || '';
    const categoryName = data?.event?.tournament?.category?.name?.toLowerCase() || '';

    const isBasketball = sportSlug.includes('basketball') || sportSlug.includes('basket') ||
        tournamentName.includes('nba') || tournamentName.includes('basket') ||
        categoryName.includes('basketball');

    const isNFL = sportSlug.includes('american-football') || sportSlug.includes('nfl') ||
        tournamentName.includes('nfl') || tournamentName.includes('super bowl');

    const isTennis = sportSlug.includes('tennis') ||
        tournamentName.includes('atp') || tournamentName.includes('wta') ||
        tournamentName.includes('itf') || tournamentName.includes('challenger');

    const isFootball = !isBasketball && !isTennis && !isNFL; // Soccer

    const generateAnalysis = async () => {
        if (!data || !data.event) return;
        setAnalyzing(true);

        const isLive = data.event.status.type === 'inprogress';
        const isScheduled = data.event.status.type === 'notstarted';

        // Format Lineups for Context
        const homeLineup = data.lineups?.home?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const awayLineup = data.lineups?.away?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const lineupsContext = `Alineación Local: ${homeLineup}\nAlineación Visitante: ${awayLineup}`;

        // NEW: Deep Analytics Context (H2H & Incidents)
        const h2hSummary = data.h2h?.teamStats ?
            `H2H Histórico: Local ${data.h2h.teamStats.homeWins}V - Empates ${data.h2h.teamStats.draws} - Visitante ${data.h2h.teamStats.awayWins}V` : "";
        // NEW: Enhanced Schema with MVP and Market Context
        const projectionSchema = isBasketball
            ? '{"mvpName": "LeBron James", "marketType": "OVER MODE", "item1": {"label": "Puntos Tot.", "value": "220.5", "type": "over"}, "item2": {"label": "Rebotes", "value": "42.5", "type": "under"}, "item3": {"label": "Triples", "value": "12.5", "type": "over"}}'
            : isNFL
                ? '{"mvpName": "Patrick Mahomes", "marketType": "OVER MODE", "item1": {"label": "Puntos", "value": "48.5", "type": "over"}, "item2": {"label": "Yardas Aire", "value": "280.5", "type": "over"}, "item3": {"label": "TDs", "value": "5.5", "type": "under"}}'
                : '{"mvpName": "Nombre Jugador", "marketType": "ANALYSIS", "item1": {"label": "Stat 1", "value": "--"}, "item2": {"label": "Stat 2", "value": "--"}, "item3": {"label": "Stat 3", "value": "--"}}';

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
            MVP Stats Candidates: ${JSON.stringify(data.bestPlayers || {})}
            
            REQUISITOS OBLIGATORIOS:
            1. IDENTIFICA EL MVP: ¿Qué jugador está dominando o tiene la mejor proyección basada en la data de "MVP Stats"?
            2. TENDENCIA DE MERCADO: ¿El partido tiende a OVER (Alta) o UNDER (Baja) en puntos/goles?
            
            DAME:
            1. Un pick de valor "PREMIUM" (Probabilidad > 75%).
            2. Análisis táctico profundo en 3 puntos clave.
            3. Proyección final del marcador.
            
            IMPORTANTE: Incluye al final este bloque exacto para el sistema de radar:
            [PROJECTIONS: ${projectionSchema}]`;

        } else if (isScheduled) {
            prompt = `Analiza este partido de ${isBasketball ? 'BALONCESTO' : isNFL ? 'FÚTBOL AMERICANO' : isTennis ? 'TENIS' : 'FÚTBOL'} PRÓXIMO (Motor v2.5 - Deep Analytics):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Liga/País: ${data.event.tournament.name} (${data.event.tournament.category?.name})
            ${lineupsContext}
            ${deepContext}
            
            REQUISITOS:
            1. SELECCIONA TU MVP: Basado en H2H y forma reciente, ¿quién será el jugador clave?
            2. DEFINE EL MERCADO: ¿Es un juego de Ataque (OVER) o Defensa (UNDER)?
            
            DAME:
            1. Predicción del Ganador y Marcador Exacto.
            2. Top 3 Oportunidades de "Props".
            3. Índice de Confianza (0-100%).
            
            IMPORTANTE: Incluye al final este bloque exacto para el sistema de radar:
            [PROJECTIONS: ${projectionSchema}]`;
        } else {
            prompt = `Analiza el resultado final (Post-Match v2.0):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Resultado: ${data.event.homeScore?.current ?? 0} - ${data.event.awayScore?.current ?? 0}
            ${lineupsContext}
            MVP Stats: ${JSON.stringify(data.bestPlayers || {})}
            
            ¿Quién fue el MVP real y por qué?`;
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
            const projMatch = content.match(/\[PROJECTIONS:\s*({.*?})\]/i);

            let cleanContent = content;

            if (confMatch) {
                setAiConfidence(parseInt(confMatch[1]));
                cleanContent = cleanContent.replace(/\[CONFIDENCE:\s*\d+\]/i, '');
            }

            if (projMatch) {
                try {
                    setProjections(JSON.parse(projMatch[1]));
                    cleanContent = cleanContent.replace(/\[PROJECTIONS:\s*{.*?}\]/i, '');
                } catch (e) {
                    console.error("Error parsing projections JSON", e);
                }
            }

            setAiAnalysis(cleanContent.trim());
        } catch (e) {
            console.error(e);
            setAiAnalysis("Error conectando con la IA. Intenta de nuevo.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-gray-400">
                <ArrowLeft className="w-5 h-5" />
                <Skeleton className="h-4 w-20 bg-white/10" />
            </div>
            <div className="h-[400px] w-full bg-white/5 rounded-[3rem] animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <MatchCardSkeleton />
                </div>
                <AnalysisSkeleton />
            </div>
        </div>
    );

    if (!data || !data.event) return (
        <div className="min-h-screen bg-black flex justify-center items-center text-white font-black uppercase tracking-widest">
            <div className="text-center space-y-4">
                <Search className="w-12 h-12 text-primary mx-auto animate-bounce-short" />
                <p>Partido no encontrado o finalizado.</p>
                <button onClick={() => router.back()} className="text-[10px] text-gray-500 hover:text-white underline">Volver al terminal</button>
            </div>
        </div>
    );

    const { event, statistics } = data;
    const periodStats = statistics?.[0]?.groups || [];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                    <div className="p-2 bg-white/5 rounded-full border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Volver al Terminal
                </button>

                {/* Cyber-Glass Scoreboard Header */}
                <div className="glass-card p-0 overflow-hidden rounded-[3.5rem] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    {/* Animated Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] pointer-events-none"></div>

                    <div className="relative z-10 p-10 md:p-14 text-center space-y-12">

                        {/* Tournament & Time */}
                        <div className="flex flex-col items-center gap-5">
                            <div className="flex items-center gap-3 px-6 py-2 bg-black/40 rounded-full border border-white/5 backdrop-blur-md shadow-lg">
                                <Image
                                    src={getCategoryImage(event.tournament.category.id)}
                                    className="w-5 h-5 rounded-full object-cover grayscale"
                                    alt=""
                                    width={20}
                                    height={20}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{event.tournament.category.name}</span>
                                <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{event.tournament.name}</span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className={clsx(
                                    "px-4 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.2)]",
                                    event.status.type === 'inprogress'
                                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                                        : "bg-white/5 border-white/10 text-gray-400"
                                )}>
                                    {event.status.type === 'inprogress' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {event.status.type === 'inprogress' ? 'EN VIVO' : event.status.type === 'finished' ? 'FINALIZADO' : 'PROGRAMADO'}
                                    </span>
                                </div>

                                {event.status.type === 'inprogress' && (
                                    <span className="text-2xl font-mono font-black text-white tracking-widest flex items-center gap-2 drop-shadow-lg">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <LiveGameClock
                                            startTimestamp={event.time?.currentPeriodStartTimestamp}
                                            statusDescription={event.status.description}
                                            statusType={event.status.type}
                                        />
                                    </span>
                                )}
                                {event.status.type === 'notstarted' && (
                                    <span className="text-xl font-mono font-black text-white/80 tracking-widest">
                                        {new Date(event.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Teams & Score */}
                        <div className="flex justify-between items-center max-w-5xl mx-auto relative px-4 md:px-0">
                            {/* Home */}
                            <div className="flex flex-col items-center gap-6 w-1/3 group/team">
                                <div className="relative transition-transform duration-500 group-hover/team:scale-105">
                                    <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover/team:opacity-60 transition-opacity duration-500"></div>
                                    <Image
                                        src={getTeamImage(event.homeTeam.id)}
                                        className="w-20 h-20 md:w-36 md:h-36 object-contain relative z-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                                        alt={event.homeTeam.name}
                                        width={144}
                                        height={144}
                                        placeholder="blur"
                                        blurDataURL={getBlurDataURL()}
                                    />
                                </div>
                                <div className="space-y-1 text-center">
                                    <h2 className="text-base md:text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">{event.homeTeam.name}</h2>
                                    <p className="text-[9px] font-black text-primary/80 uppercase tracking-[0.4em]">Local</p>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-center gap-6 flex-1">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/5 blur-[40px] rounded-full"></div>
                                    <div className="text-5xl md:text-[7rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-mono flex items-center gap-4 md:gap-8 drop-shadow-2xl relative z-10">
                                        <span>{event.homeScore?.current ?? 0}</span>
                                        <span className={clsx("text-white/20 text-4xl md:text-6xl -mt-4 md:-mt-8", event.status.type === 'inprogress' && "animate-pulse")}>:</span>
                                        <span>{event.awayScore?.current ?? 0}</span>
                                    </div>
                                </div>

                                {/* Period Breakdown */}
                                <div className="flex gap-2 p-1.5 bg-black/40 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto max-w-full">
                                    {[1, 2, 3, 4, 5].map(p => {
                                        const h = event.homeScore?.[`period${p}`];
                                        const a = event.awayScore?.[`period${p}`];
                                        if (h === undefined && a === undefined) return null;
                                        return (
                                            <div key={p} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5">
                                                <span className="text-[6px] font-black text-gray-500 uppercase">P{p}</span>
                                                <div className="flex text-[9px] font-bold font-mono text-white leading-none">
                                                    {h}<span className="text-gray-500 mx-0.5">:</span>{a}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Away */}
                            <div className="flex flex-col items-center gap-6 w-1/3 group/team text-right">
                                <div className="relative transition-transform duration-500 group-hover/team:scale-105">
                                    <div className="absolute inset-0 bg-white/10 blur-[50px] rounded-full opacity-0 group-hover/team:opacity-60 transition-opacity duration-500"></div>
                                    <Image
                                        src={getTeamImage(event.awayTeam.id)}
                                        className="w-20 h-20 md:w-36 md:h-36 object-contain relative z-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                                        alt={event.awayTeam.name}
                                        width={144}
                                        height={144}
                                        placeholder="blur"
                                        blurDataURL={getBlurDataURL()}
                                    />
                                </div>
                                <div className="space-y-1 text-center">
                                    <h2 className="text-base md:text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">{event.awayTeam.name}</h2>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Visitante</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column (8 units) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Win Prob & Social */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 rounded-[2.5rem] border-white/5 bg-[#080808]/60 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-6 opacity-60">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                    <span className="text-[10px] font-black font-mono uppercase tracking-widest text-white">Probabilidad de Victoria</span>
                                </div>
                                <WinProbabilityChart
                                    incidents={data.incidents}
                                    homeTeam={data.event.homeTeam.name}
                                    awayTeam={data.event.awayTeam.name}
                                    currentStatus={data.event.status.type}
                                />
                            </div>
                            <div className="glass-card p-2 rounded-[2.5rem] border-white/5 bg-[#080808]/60 backdrop-blur-md overflow-hidden max-h-[500px]">
                                <SocialFeed matchId={id as string} />
                            </div>
                        </div>

                        {/* Community Sentiment (Cyber) */}
                        <div className="glass-card rounded-[2.5rem] border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-50"></div>

                            <div className="relative z-10 p-8 md:p-10 space-y-8">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg">
                                            <Users className="w-6 h-6 text-primary animate-pulse-slow" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Inteligencia Colectiva</h3>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Sentimiento Global PickGenius</p>
                                        </div>
                                    </div>
                                    <div className="px-5 py-2 bg-white/5 rounded-xl border border-white/5 text-right">
                                        <div className="text-2xl font-black text-white font-mono leading-none">
                                            {((data.votes?.vote1 || 0) + (data.votes?.voteX || 0) + (data.votes?.vote2 || 0)).toLocaleString()}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">Votos Totales</span>
                                    </div>
                                </div>

                                {/* Sentiment Bars */}
                                {(() => {
                                    const v1 = data.votes?.vote1 || 0;
                                    const vX = data.votes?.voteX || 0;
                                    const v2 = data.votes?.vote2 || 0;
                                    const total = v1 + vX + v2 || 1;
                                    const p1 = Math.round((v1 / total) * 100);
                                    const pX = Math.round((vX / total) * 100);
                                    const p2 = Math.round((v2 / total) * 100);

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end px-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white">{event.homeTeam.name} <span className="text-primary ml-1">{p1}%</span></span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Empate {pX}%</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white text-right"><span className="text-purple-400 mr-1">{p2}%</span> {event.awayTeam.name}</span>
                                            </div>

                                            <div className="h-4 bg-black/40 rounded-full flex overflow-hidden border border-white/5">
                                                <div style={{ width: `${p1}%` }} className="h-full bg-gradient-to-r from-primary to-primary/60 box-shadow-glow"></div>
                                                <div style={{ width: `${pX}%` }} className="h-full bg-white/10 border-l border-r border-black/20"></div>
                                                <div style={{ width: `${p2}%` }} className="h-full bg-gradient-to-l from-purple-500 to-purple-500/60 box-shadow-glow"></div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Lineups */}
                        {data.lineups && (data.lineups.home?.players?.length > 0 || data.lineups.away?.players?.length > 0) && (
                            <div className="glass-card p-1 rounded-[3rem] border-white/5">
                                <div className="bg-[#080808]/80 backdrop-blur-xl rounded-[2.9rem] p-8 md:p-12 space-y-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6 text-primary" />
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Alineaciones</h3>
                                        </div>
                                        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-50"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                                        {/* Home */}
                                        <div className="space-y-6">
                                            <h4 className="flex items-center gap-3 text-lg font-black text-white italic uppercase border-b border-primary/20 pb-3">
                                                <span className="w-2 h-2 rounded-full bg-primary box-shadow-glow"></span>
                                                {event.homeTeam.name}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {data.lineups.home.players.filter((p: any) => !p.substitute).map((p: any) => (
                                                    <div
                                                        key={p.player.id}
                                                        onClick={() => setSelectedPlayer({
                                                            ...p.player,
                                                            position: p.position,
                                                            shirtNumber: p.shirtNumber,
                                                            teamId: event.homeTeam.id,
                                                            teamName: event.homeTeam.name
                                                        })}
                                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all group cursor-pointer"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0">
                                                            <Image src={getPlayerImage(p.player.id)} alt="" width={32} height={32} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase truncate group-hover:text-white transition-colors">{p.player.name}</p>
                                                            <p className="text-[8px] font-mono text-primary/70">{p.position}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Away */}
                                        <div className="space-y-6">
                                            <h4 className="flex items-center justify-end gap-3 text-lg font-black text-white italic uppercase border-b border-white/10 pb-3 text-right">
                                                {event.awayTeam.name}
                                                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {data.lineups.away.players.filter((p: any) => !p.substitute).map((p: any) => (
                                                    <div
                                                        key={p.player.id}
                                                        onClick={() => setSelectedPlayer({
                                                            ...p.player,
                                                            position: p.position,
                                                            shirtNumber: p.shirtNumber,
                                                            teamId: event.awayTeam.id,
                                                            teamName: event.awayTeam.name
                                                        })}
                                                        className="flex items-center flex-row-reverse text-right gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.05] transition-all group cursor-pointer"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0">
                                                            <Image src={getPlayerImage(p.player.id)} alt="" width={32} height={32} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase truncate group-hover:text-white transition-colors">{p.player.name}</p>
                                                            <p className="text-[8px] font-mono text-purple-400/70">{p.position}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (4 units) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Cyber AI Analysis */}
                        <div className="glass-card p-[1px] rounded-[2.5rem] border-primary/30 relative overflow-hidden group hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] transition-shadow duration-500">
                            <div className="absolute inset-0 bg-primary/10 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                            <div className="bg-[#090909] rounded-[2.4rem] p-6 md:p-8 space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Zap className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                                            {data.event.status.type === 'notstarted' ? 'Predicción IA' : 'Análisis IA'}
                                        </h3>
                                    </div>
                                    {aiConfidence !== null && (
                                        <AIConfidenceMeter confidence={aiConfidence} size="sm" showLabel={false} />
                                    )}
                                </div>

                                {!aiAnalysis ? (
                                    <div className="text-center space-y-5 py-6">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 animate-pulse-slow">
                                            <Sparkles className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest px-4">
                                            {data.event.status.type === 'notstarted' ? "Desbloquea el radar predictivo" : "Activa el analizador táctico"}
                                        </p>
                                        <button
                                            onClick={generateAnalysis}
                                            disabled={analyzing}
                                            className="w-full py-4 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] disabled:opacity-50 disabled:shadow-none"
                                        >
                                            {analyzing ? "PROCESANDO..." : "EJECUTAR MOTOR V2.5"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Analysis Content */}
                                        <div className={clsx(
                                            "prose prose-invert prose-sm max-w-none text-[12px] leading-relaxed text-gray-300 font-medium bg-white/5 p-4 rounded-2xl border border-white/5",
                                            !isGold && "blur-sm select-none opacity-50 mask-gradient"
                                        )}>
                                            {aiAnalysis}
                                        </div>

                                        {/* Lock Overlay */}
                                        {!isGold && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2.4rem] z-20 space-y-3">
                                                <div className="p-3 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce-short">
                                                    <Lock className="w-6 h-6 text-black" />
                                                </div>
                                                <h4 className="text-sm font-black text-white uppercase italic tracking-wider">Contenido Elite</h4>
                                                <button onClick={handleUpgrade} className="text-[9px] font-black pointer-events-auto text-amber-500 hover:text-white uppercase tracking-widest underline">Desbloquear Acceso Total</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="glass-card p-[1px] rounded-[2.5rem] border-white/10">
                            <div className="bg-[#0a0a0a] rounded-[2.4rem] p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Estadísticas</h3>
                                </div>

                                {!periodStats.length ? (
                                    <div className="py-8 text-center text-[10px] font-black uppercase text-gray-600 tracking-widest">
                                        Esperando datos en vivo...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {periodStats.slice(0, 1).map((group: any) => (
                                            <div key={group.groupName} className="space-y-4">
                                                {group.statisticsItems.slice(0, 8).map((item: any, i: number) => {
                                                    const hVal = parseFloat(item.home);
                                                    const aVal = parseFloat(item.away);
                                                    const total = hVal + aVal || 1;
                                                    const hPerc = (hVal / total) * 100;

                                                    return (
                                                        <div key={i} className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500 tracking-wider">
                                                                <span className={clsx(hVal > aVal && "text-primary")}>{item.home}</span>
                                                                <span className="text-white bg-white/5 px-2 py-0.5 rounded text-[8px]">{translateStat(item.name)}</span>
                                                                <span className={clsx(aVal > hVal && "text-white")}>{item.away}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                                                                <div className="h-full bg-primary box-shadow-glow" style={{ width: `${hPerc}%` }}></div>
                                                                <div className="flex-1"></div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Players */}
                {data.bestPlayers && Object.keys(data.bestPlayers).length > 0 && (
                    <div className="glass-card p-1 rounded-[3rem] border-white/5 mt-12 bg-gradient-to-br from-white/5 to-transparent">
                        <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.9rem] p-10 md:p-14 space-y-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Trophy className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter text-center">MVP Leaderboard</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Rendimiento Destacado</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                {Object.entries(data.bestPlayers).map(([category, players]: [string, any]) => (
                                    <div key={category} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:border-primary/20 transition-all hover:-translate-y-1 duration-300 group">
                                        <div className="flex justify-center mb-6">
                                            <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-white/5 group-hover:bg-primary group-hover:text-black transition-colors">{translateStat(category)}</span>
                                        </div>
                                        <div className="space-y-4">
                                            {(players as any[]).map((entry, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedPlayer({
                                                        ...entry.player,
                                                        teamId: entry.team?.id,
                                                        teamName: entry.team?.name
                                                    })}
                                                    className={clsx(
                                                        "flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-xl p-2 transition-colors",
                                                        entry.team?.id === event.awayTeam.id ? "flex-row-reverse text-right" : "text-left"
                                                    )}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden shrink-0 shadow-lg relative group/p">
                                                        <Image src={getPlayerImage(entry.player.id)} alt="" width={40} height={40} className="w-full h-full object-cover group-hover/p:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={clsx(
                                                            "flex items-baseline gap-2",
                                                            entry.team?.id === event.awayTeam.id ? "flex-row-reverse" : "flex-row"
                                                        )}>
                                                            <span className="text-xl font-black text-white font-mono leading-none">{entry.value}</span>
                                                            <span className="text-[9px] font-black text-gray-500 uppercase truncate max-w-[80px]">{entry.player.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Premium Projection Card */}
                {(isGold || isAuthorizedAdmin) && (
                    <div className="animate-fade-in-up delay-200">
                        <PremiumProjectionCard
                            sport={isBasketball ? 'basketball' : isNFL ? 'nfl' : isTennis ? 'tennis' : 'football'}
                            projections={projections}
                            isVisible={!!aiAnalysis}
                            confidence={aiConfidence || 85}
                        />
                    </div>
                )}

                {/* Player Modal */}
                <PlayerModal
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    player={selectedPlayer ? {
                        id: selectedPlayer.id,
                        name: selectedPlayer.name,
                        position: selectedPlayer.position,
                        shirtNumber: selectedPlayer.shirtNumber,
                        teamId: selectedPlayer.teamId,
                        teamName: selectedPlayer.teamName
                    } : null}
                    sport={isBasketball ? 'basketball' : isNFL ? 'nfl' : isTennis ? 'tennis' : 'football'}
                    stats={selectedPlayer?.stats}
                />
            </div>
        </div>
    );
}
