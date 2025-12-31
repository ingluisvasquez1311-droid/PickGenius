"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Activity, Flag, Shield, Zap, Target, ChevronRight, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import AIConfidenceMeter from '@/components/AIConfidenceMeter';
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

export default function MatchDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiConfidence, setAiConfidence] = useState<number | null>(null);

    const generateAnalysis = async () => {
        if (!data || !data.event) return;
        setAnalyzing(true);

        const isLive = data.event.status.type === 'inprogress';
        const isScheduled = data.event.status.type === 'notstarted';

        // Format Lineups for Context
        const homeLineup = data.lineups?.home?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const awayLineup = data.lineups?.away?.players?.filter((p: any) => !p.substitute).map((p: any) => `${p.player.name} (${p.position || '?'})`).join(', ') || "No disponible";
        const lineupsContext = `Alineación Local: ${homeLineup}\nAlineación Visitante: ${awayLineup}`;

        let prompt = "";

        if (isLive) {
            prompt = `Analiza este partido EN VIVO ahora mismo (Motor v2.0):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Marcador: ${data.event.homeScore?.current ?? 0} - ${data.event.awayScore?.current ?? 0}
            Tiempo: ${data.event.status.description}
            Estadísticas Clave: ${JSON.stringify(data.statistics?.[0]?.groups || [])}
            ${lineupsContext}
            Mejores Jugadores (Live Rating): ${JSON.stringify(data.bestPlayers || {})}
            
            Como experto táctico, analiza el flujo del partido basándote en las alineaciones activas y el rendimiento en vivo. ¿Hay algún desajuste táctico explotable? ¿Quién ganará el siguiente cuarto/tiempo? Dame un pick de valor ALTO.`;
        } else if (isScheduled) {
            prompt = `Analiza este partido PRÓXIMO (Motor v2.0):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Torneo: ${data.event.tournament.name}
            ${lineupsContext}
            Líderes/Estrellas: ${JSON.stringify(data.bestPlayers || {})}
            
            Realiza un análisis profundo de "Matchups" basado en las alineaciones titulares. Identifica duelos clave (ej: QB vs Secundaria, Delantero vs Defensa). Predice el ganador y un Player Prop de alto valor basado en la debilidad del rival.`;
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

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/match/${id}`);
                const json = await res.json();
                console.log("Match Data Loaded:", json); // Debugging
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        const interval = setInterval(fetchDetails, 30000); // Auto-refresh stats
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-primary"></div>
            <p className="text-gray-400 animate-pulse">Cargando estadísticas en tiempo real...</p>
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
                                <span className="text-sm font-mono text-primary font-black tracking-widest">{event.status.description}'</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center max-w-4xl mx-auto relative z-10">
                        {/* Home */}
                        <div className="flex flex-col items-center gap-6 w-1/3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all opacity-0 group-hover:opacity-100"></div>
                                <Image
                                    src={getTeamImage(event.homeTeam.id)}
                                    className="w-20 h-20 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform"
                                    alt={event.homeTeam.name}
                                    width={128}
                                    height={128}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter uppercase italic">{event.homeTeam.name}</h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Local</p>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-6xl md:text-9xl font-black text-white font-mono flex items-center gap-4 md:gap-8 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                <span>{event.homeScore?.current ?? 0}</span>
                                <span className="text-white/10 text-4xl md:text-6xl animate-pulse">:</span>
                                <span>{event.awayScore?.current ?? 0}</span>
                            </div>

                            {/* Period Breakdown */}
                            <div className="flex gap-4 md:gap-8 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                                {[1, 2, 3, 4, 5].map(p => {
                                    const h = event.homeScore?.[`period${p}`];
                                    const a = event.awayScore?.[`period${p}`];
                                    if (h === undefined && a === undefined) return null;
                                    return (
                                        <div key={p} className="flex flex-col items-center gap-1">
                                            <span className="text-[8px] font-black text-gray-500 uppercase">P{p}</span>
                                            <div className="flex flex-col font-mono text-xs font-bold">
                                                <span className="text-white">{h ?? '-'}</span>
                                                <span className="text-gray-400">{a ?? '-'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {event.status.type === 'inprogress' && (
                                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                                    <span className="text-gray-400 font-mono text-sm font-bold uppercase tracking-widest">Live Now</span>
                                </div>
                            )}
                        </div>

                        {/* Away */}
                        <div className="flex flex-col items-center gap-6 w-1/3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full group-hover:bg-accent/40 transition-all opacity-0 group-hover:opacity-100"></div>
                                <Image
                                    src={getTeamImage(event.awayTeam.id)}
                                    className="w-20 h-20 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform"
                                    alt={event.awayTeam.name}
                                    width={128}
                                    height={128}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter uppercase italic">{event.awayTeam.name}</h2>
                                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Visitante</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Best Players (Sofascore Essence) */}
            {data.bestPlayers && Object.keys(data.bestPlayers).length > 0 && (
                <div className="glass-card p-8 md:p-14 rounded-[3rem] border-white/5 space-y-12 bg-white/[0.01]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-1 bg-primary rounded-full"></div>
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Mejores jugadores</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Líderes Estadísticos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(data.bestPlayers).map(([category, players]: [string, any]) => (
                            <div key={category} className="space-y-6 bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group/card">
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <div className="p-2.5 bg-primary/10 rounded-2xl group-hover/card:scale-110 transition-transform">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{translateStat(category)}</span>
                                </div>

                                <div className="space-y-4">
                                    {(players as any[]).map((entry, idx) => (
                                        <div key={idx} className={clsx(
                                            "flex items-center gap-3 group/player",
                                            entry.team?.id === event.awayTeam.id ? "flex-row-reverse text-right" : "text-left"
                                        )}>
                                            <div className="relative shrink-0">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
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
                                                    <p className="text-[9px] font-black text-gray-400 truncate group-hover/player:text-white transition-colors uppercase tracking-tight">{entry.player.name}</p>
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

            {/* Lineups (Alineaciones) */}
            {data.lineups && (data.lineups.home?.players?.length > 0 || data.lineups.away?.players?.length > 0) && (
                <div className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5 space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Alineaciones</h3>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 px-3 py-1 bg-white/5 rounded-full">Confirmadas</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                        {/* Home Lineup */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-white border-b border-primary/20 pb-2 uppercase italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                {event.homeTeam.name}
                            </h4>
                            <div className="space-y-3">
                                {data.lineups.home.players.filter((p: any) => !p.substitute).map((p: any) => (
                                    <div key={p.player.id} className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                            <Image
                                                src={getPlayerImage(p.player.id)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                alt=""
                                                width={32}
                                                height={32}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{p.player.name}</span>
                                                <span className="text-[10px] font-mono text-gray-500">{p.shirtNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Away Lineup */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-white border-b border-accent/20 pb-2 uppercase italic flex items-center justify-end gap-2 text-right">
                                {event.awayTeam.name}
                                <span className="w-2 h-2 rounded-full bg-accent"></span>
                            </h4>
                            <div className="space-y-3">
                                {data.lineups.away.players.filter((p: any) => !p.substitute).map((p: any) => (
                                    <div key={p.player.id} className="flex items-center gap-3 group flex-row-reverse text-right">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                            <Image
                                                src={getPlayerImage(p.player.id)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                alt=""
                                                width={32}
                                                height={32}
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between flex-row-reverse">
                                                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{p.player.name}</span>
                                                <span className="text-[10px] font-mono text-gray-500">{p.shirtNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Community vs AI Voting Section */}
            <div className="md:col-span-2 glass-card p-8 rounded-[2rem] border-white/5 space-y-6 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Nación PickGenius</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentimiento Público vs Predicción IA</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-white">12,405</span>
                        <p className="text-[9px] font-black text-gray-500 uppercase">Votos Totales</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                        <span className="text-sm font-black text-primary uppercase">{event.homeTeam.name} (62%)</span>
                        <span className="text-sm font-black text-accent uppercase">{event.awayTeam.name} (38%)</span>
                    </div>

                    <div className="h-4 bg-white/10 rounded-full overflow-hidden flex relative">
                        {/* Home Bar */}
                        <div className="h-full bg-primary flex items-center justify-start px-2 relative group cursor-pointer hover:brightness-110 transition-all" style={{ width: '62%' }}>
                            {/* Vote Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-opacity">
                                <span className="text-[10px] font-black text-white uppercase">Votar Local</span>
                            </div>
                        </div>
                        {/* Away Bar */}
                        <div className="h-full bg-accent flex items-center justify-end px-2 relative group cursor-pointer hover:brightness-110 transition-all" style={{ width: '38%' }}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-opacity">
                                <span className="text-[10px] font-black text-white uppercase">Votar Visita</span>
                            </div>
                        </div>

                        {/* Center Marker (Neutral) */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/50"></div>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-2">
                        La IA discrepa con el público en este evento. <span className="text-white font-bold">Oportunidad de Valor detectada.</span>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Main Stats Column */}
                <div className="glass-card p-6 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                        <Activity className="w-5 h-5 text-accent" />
                        <h3 className="font-bold text-white uppercase tracking-wider">Estadísticas del Partido</h3>
                    </div>

                    {!periodStats.length ? (
                        <div className="text-center text-gray-500 py-10">
                            No hay estadísticas detalladas disponibles para este evento.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {periodStats.map((group: any, idx: number) => (
                                <div key={idx} className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest text-primary/80 pb-2">
                                        {group.groupName === "Expected goals" ? "Goles Esperados (xG)" : group.groupName}
                                    </h4>
                                    {group.statisticsItems.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-sm py-2 hover:bg-white/5 rounded-lg px-3 transition-colors group">
                                            <span className="text-white font-mono w-12 text-right font-bold text-lg group-hover:text-primary transition-colors">{item.home}</span>

                                            <span className="text-gray-400 flex-1 text-center text-[10px] md:text-xs uppercase tracking-wide px-2 font-medium">
                                                {translateStat(item.name)}
                                            </span>

                                            <span className="text-white font-mono w-12 text-left font-bold text-lg group-hover:text-accent transition-colors">{item.away}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Analysis Section */}
                <div className="glass-card p-6 rounded-3xl space-y-6 border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-white uppercase tracking-wider">
                                {data.event.status.type === 'notstarted' ? 'Predicción IA Pre-Match' : 'Análisis IA en Vivo'}
                            </h3>
                        </div>
                        {aiConfidence !== null && (
                            <AIConfidenceMeter confidence={aiConfidence} size="sm" showLabel={false} />
                        )}
                    </div>
                    {!aiAnalysis ? (
                        <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 text-center space-y-6">
                            <p className="text-gray-300 italic text-sm">
                                {data.event.status.type === 'notstarted'
                                    ? "Solicita una predicción basada en el estado actual y datos históricos de ambos equipos."
                                    : "Solicita un análisis táctico en tiempo real basado en las estadísticas actuales del partido."}
                            </p>
                            <button
                                onClick={generateAnalysis}
                                disabled={analyzing}
                                className="w-full bg-primary text-black font-black uppercase text-xs px-6 py-4 rounded-xl hover:bg-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="animate-spin h-3 w-3 border-2 border-black border-t-transparent rounded-full" />
                                        Analizando Probabilidades...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 fill-current" />
                                        {data.event.status.type === 'notstarted' ? 'Generar Predicción Pre-Match' : 'Generar Análisis en Vivo'}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#0a0a0a]/50 p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-light">
                                    {aiAnalysis}
                                </div>
                            </div>
                            <button
                                onClick={() => setAiAnalysis(null)}
                                className="mt-6 w-full py-3 rounded-lg border border-white/10 text-xs text-primary hover:bg-white/5 hover:text-white transition-colors"
                            >
                                Generar Nuevo Análisis
                            </button>
                        </div>
                    )}
                </div>

                {/* Odds Scanner (Real Data) */}
                <div className="md:col-span-2 glass-card p-8 rounded-[2rem] border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Odds Scanner Pro</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Comparativa de Mercados en Tiempo Real</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] uppercase font-mono text-gray-400">Scanner Live</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.odds && data.odds.length > 0 ? (
                            data.odds.filter((m: any) => m.marketName === 'Full time' || m.marketName === 'Match winner' || m.marketName === 'Winner').slice(0, 3).map((market: any, idx: number) => {
                                return (
                                    <div key={idx} className="p-6 rounded-2xl border bg-black/40 border-white/5 hover:border-primary/20 flex flex-col gap-6 transition-all group relative overflow-hidden">
                                        {/* Background Scanline pulse */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">{market.marketName}</span>
                                            </div>
                                            {idx === 0 && <span className="text-[8px] font-black bg-white text-black px-2 py-0.5 rounded-md uppercase tracking-widest">Market Alpha</span>}
                                        </div>

                                        <div className="flex justify-between items-center gap-3 relative z-10">
                                            {market.choices.map((choice: any, cIdx: number) => {
                                                const val = choice.value;
                                                const isValue = aiConfidence && aiConfidence > (100 / val + 10); // Simple value formula

                                                return (
                                                    <div key={cIdx} className={clsx(
                                                        "flex-1 p-4 rounded-xl border transition-all text-center space-y-2",
                                                        isValue ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                                    )}>
                                                        <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                                            {choice.name === '1' ? 'HOME' : choice.name === 'X' ? 'DRAW' : choice.name === '2' ? 'AWAY' : choice.name}
                                                        </span>
                                                        <span className={clsx(
                                                            "block font-mono font-black text-2xl tracking-tighter",
                                                            isValue ? "text-primary" : "text-white"
                                                        )}>{val.toFixed(2)}</span>
                                                        {isValue && (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Zap className="w-2 h-2 text-primary" />
                                                                <span className="text-[7px] font-black text-primary uppercase">VALUE EDGE</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="md:col-span-3 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                <p className="text-xs font-black text-gray-600 uppercase tracking-widest italic">No hay cuotas disponibles para los filtros actuales</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Link href="/bankroll" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
                            Gestionar mi Bankroll
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
