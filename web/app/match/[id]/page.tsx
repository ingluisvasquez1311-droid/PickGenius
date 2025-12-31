"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Activity, Flag, Shield, Zap, Target, ChevronRight, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LiveGameClock from '@/components/LiveGameClock'; // Componente de reloj en vivo
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



        // Detect Sport for Context-Aware Prompts
        // Robust detection: Check explicit slug, tournament name, or category
        const sportSlug = data.sport?.slug || data.event.sport?.slug || '';
        const tournamentName = data.event.tournament?.name?.toLowerCase() || '';
        const categoryName = data.event.tournament?.category?.name?.toLowerCase() || '';

        const isBasketball = sportSlug.includes('basketball') || sportSlug.includes('basket') ||
            tournamentName.includes('nba') || tournamentName.includes('basket') ||
            categoryName.includes('basketball');

        const isTennis = sportSlug.includes('tennis') ||
            tournamentName.includes('atp') || tournamentName.includes('wta') ||
            tournamentName.includes('itf') || tournamentName.includes('challenger');

        const isFootball = !isBasketball && !isTennis; // Default to football only if others fail

        let prompt = "";

        if (isLive) {
            prompt = `Analiza este partido de ${isBasketball ? 'BALONCESTO' : isTennis ? 'TENIS' : 'FÚTBOL'} EN VIVO (Motor v2.2 - Contexto Profundo):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Liga/País: ${data.event.tournament.name} (${data.event.tournament.category?.name})
            Marcador: ${data.event.homeScore?.current ?? 0} - ${data.event.awayScore?.current ?? 0}
            Tiempo: ${data.event.status.description}
            Estadísticas Clave: ${JSON.stringify(data.statistics?.[0]?.groups || [])}
            ${lineupsContext}
            Mejores Jugadores: ${JSON.stringify(data.bestPlayers || {})}
            
            CONTEXTO REQUERIDO:
            - Usa tu conocimiento de la liga "${data.event.tournament.name}" para determinar si el ritmo actual es alto o bajo comparado con el promedio de esta competición.
            - Considera el historial (Head-to-Head) histórico entre estos dos equipos para predecir si habrá remontada o dominio.

            REQUISITOS OBLIGATORIOS DEL ANÁLISIS:
            1. Predicción de Ganador del siguiente periodo (basado en momentum).
            ${isBasketball ? `
            2. PROYECCIÓN DE PUNTOS TOTALES: Ajusta tu predicción según el promedio de anotación de la liga ${data.event.tournament.name} y el ritmo actual.
            3. ANÁLISIS DE JUGADORES: Props clave (Puntos/Rebotes) considerando la defensa rival.
            ` : isTennis ? `
            2. ANÁLISIS DE SETS/GAMES: Momentum del partido y superficie.
            3. QUIEBRES DE SERVICIO: Probabilidad de break basada en presión.
            ` : `
            2. ANÁLISIS DE CÓRNERS: ¿El ritmo y la necesidad de gol sugieren OVER/UNDER?
            3. ANÁLISIS DE GOLES: Proyección ajustada al tiempo restante.
            `}
            4. Dame un pick de valor ALTO final.`;

        } else if (isScheduled) {
            prompt = `Analiza este partido de ${isBasketball ? 'BALONCESTO' : isTennis ? 'TENIS' : 'FÚTBOL'} PRÓXIMO (Motor v2.3 - Análisis de Forma):
            Evento: ${data.event.homeTeam.name} vs ${data.event.awayTeam.name}
            Liga/País: ${data.event.tournament.name} (${data.event.tournament.category?.name})
            ${lineupsContext}
            Líderes/Estrellas: ${JSON.stringify(data.bestPlayers || {})}
            
            CONTEXTO DE FORMA REQUERIDO (OBLIGATORIO):
            1. HISTORIAL H2H: ¿Quién domina los enfrentamientos directos recientes?
            2. ÚLTIMOS 5 PARTIDOS: Analiza la racha actual (Ganados/Perdidos) de ambos equipos. ¿Vienen en racha positiva o negativa?
            3. FACTOR LOCAL/VISITA: ¿Cómo se comporta ${data.event.homeTeam.name} en casa y ${data.event.awayTeam.name} de visita?
            
            REQUISITOS OBLIGATORIOS DEL ANÁLISIS:
            1. Predicción de Ganador (Moneyline) basada estrictamente en la FORMA RECIENTE.
            ${isBasketball ? `
            2. PUNTOS TOTALES: Si ambos vienen anotando mucho en sus últimos 5 juegos, proyecta OVER. Si defienden bien, proyecta UNDER.
            3. HANDICAP: Calcula el margen de victoria basado en el diferencial de puntos de sus últimos juegos.
            ` : isTennis ? `
            2. JUEGOS TOTALES: Basado en si sus últimos partidos fueron largos (3 sets) o cortos.
            3. ESTADO FÍSICO: ¿Viene de partidos agotadores recientes?
            ` : `
            2. MERCADO DE GOLES: Si en sus últimos 5 partidos hubo muchos goles, sugiere OVER.
            3. AMBOS ANOTAN: ¿Suelen marcar y recibir goles recientemente?
            `}
            4. Un Player Prop de alto valor estadístico.`;
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

                            {/* Period Breakdown - Cleaner Look */}
                            <div className="flex gap-4 md:gap-8 px-6 py-3">
                                {[1, 2, 3, 4, 5].map(p => {
                                    const h = event.homeScore?.[`period${p}`];
                                    const a = event.awayScore?.[`period${p}`];
                                    if (h === undefined && a === undefined) return null;
                                    return (
                                        <div key={p} className="flex flex-col items-center gap-1">
                                            <span className="text-[8px] font-black text-gray-600 uppercase">P{p}</span>
                                            <div className="flex flex-col font-mono text-xs font-bold gap-1">
                                                <span className="text-white">{h ?? '-'}</span>
                                                <span className="text-gray-400">{a ?? '-'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {event.status.type === 'inprogress' && (
                                <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                                    <div className="text-red-500 font-mono text-sm font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
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
                        <div className="flex flex-col items-center gap-6 w-1/3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"></div>
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
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Visitante</p>
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
                            <h4 className="text-sm font-black text-white border-b border-white/20 pb-2 uppercase italic flex items-center justify-end gap-2 text-right">
                                {event.awayTeam.name}
                                <span className="w-2 h-2 rounded-full bg-white"></span>
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
            <div className="md:col-span-2 glass-card p-8 rounded-[2rem] border-white/5 space-y-6 bg-gradient-to-r from-orange-900/10 to-transparent">
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
                        <span className="text-sm font-black text-white uppercase">{event.awayTeam.name} (38%)</span>
                    </div>

                    <div className="h-4 bg-white/10 rounded-full overflow-hidden flex relative">
                        {/* Home Bar - Primary Orange */}
                        <div className="h-full bg-primary flex items-center justify-start px-2 relative group cursor-pointer hover:brightness-110 transition-all" style={{ width: '62%' }}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-opacity">
                                <span className="text-[10px] font-black text-black uppercase">Votar Local</span>
                            </div>
                        </div>
                        {/* Away Bar - White/Gray for clear contrast with Orange */}
                        <div className="h-full bg-white/50 flex items-center justify-end px-2 relative group cursor-pointer hover:brightness-110 transition-all" style={{ width: '38%' }}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-opacity">
                                <span className="text-[10px] font-black text-white uppercase">Votar Visita</span>
                            </div>
                        </div>

                        {/* Center Marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/50"></div>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-2">
                        La IA discrepa con el público en este evento. <span className="text-white font-bold">Oportunidad de Valor detectada.</span>
                    </p>
                </div>
            </div>

            {/* Stats Grid - Side by Side with AI on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Stats Column (Takes 2/3 width) */}
                <div className="glass-card p-6 rounded-3xl space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                        <Activity className="w-5 h-5 text-accent" />
                        <h3 className="font-bold text-white uppercase tracking-wider">Estadísticas del Partido</h3>
                    </div>

                    {!periodStats.length ? (
                        <div className="text-center text-gray-500 py-10">
                            No hay estadísticas detalladas disponibles para este evento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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



            </div>
        </div>
    );
}
