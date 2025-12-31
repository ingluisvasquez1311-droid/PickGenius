"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Activity, Trophy, Target, ArrowLeft,
    TrendingUp, BarChart3, AlertTriangle, Zap,
    Calendar, Star, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import PropConsistencyMatrix from '@/components/PropConsistencyMatrix';
import KellyCalculator from '@/components/KellyCalculator';

export default function PlayerAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [isProMode, setIsProMode] = useState(false);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await fetch(`/api/player/${params.id}`);
                const json = await res.json();
                if (json.player) {
                    setData(json);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [params.id]);

    const runAIAnalysis = async () => {
        if (!data) return;
        setAnalyzing(true);

        try {
            const res = await fetch('/api/player-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName: data.player.name,
                    position: data.player.position,
                    team: data.player.team?.name,
                    sport: params.sport,
                    lastMatches: data.lastMatches
                })
            });

            const result = await res.json();
            setAnalysis(result);

        } catch (e) {
            console.error(e);
            setAnalysis({
                predictions: [],
                error: "No se pudo generar el análisis"
            });
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Activity className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!data) return <div className="text-white pt-32 text-center">Jugador no encontrado</div>;

    const { player, lastMatches } = data;

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/10 blur-[200px]"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/10 blur-[180px]"></div>
            </div>

            {/* Header */}
            <div className="pt-24 pb-8 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border-2 border-primary/20 p-1">
                        <img
                            src={`https://wsrv.nl/?url=https://api.sofascore.app/api/v1/player/${player.id}/image&w=200&h=200&fit=cover&noproxy=1`}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://www.sofascore.com/static/images/default-player.png' }}
                        />
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{player.team?.name}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{player.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400">
                        <span className="text-sm font-bold uppercase">{player.position}</span>
                        <span>•</span>
                        <span className="text-sm font-bold uppercase text-primary">{player.country?.name}</span>
                    </div>
                </div>
            </div>

            {/* AI Predictions Section */}
            <div className="px-4 md:px-12 max-w-7xl mx-auto mb-16 relative z-10">
                {!analysis ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <button
                            onClick={runAIAnalysis}
                            disabled={analyzing}
                            className="group relative px-12 py-6 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] flex items-center justify-center gap-4 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                            {analyzing ? <Activity className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8 fill-white animate-pulse" />}
                            <span className="text-2xl font-black italic uppercase tracking-wider text-white">
                                {analyzing ? 'SINCRONIZANDO IA...' : 'GENERAR PREDICCIONES OVER/UNDER'}
                            </span>
                        </button>
                        {!analyzing && (
                            <p className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] text-center">
                                Análisis de 150+ métricas en tiempo real para {player.name}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Header Banner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-br from-primary/10 via-black to-black border border-primary/20 p-10 rounded-[3rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Activity className="w-32 h-32 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Zap className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                        PROPS <span className="text-primary">ESTILO BETPLAY</span>
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-xl leading-relaxed">
                                    Líneas Over/Under optimizadas para mercados de alto valor. Basado en rendimiento histórico y táctico.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsProMode(!isProMode)}
                                className={clsx(
                                    "relative z-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border shrink-0",
                                    isProMode
                                        ? "bg-primary text-black border-primary shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <Target className={clsx("w-5 h-5", isProMode ? "fill-black" : "text-gray-500")} />
                                {isProMode ? "MODO PRO ACTIVADO" : "ACTIVAR HERRAMIENTAS PRO"}
                            </button>
                        </div>

                        {/* Predictions Grid */}
                        <div className="space-y-8">
                            {analysis.predictions && analysis.predictions.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {analysis.predictions.map((pred: any, i: number) => (
                                            <div key={i} className="group bg-[#0a0a0a] hover:bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] transition-all relative overflow-hidden flex flex-col justify-between h-full">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <div className={clsx(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                        pred.confidence >= 80 ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-gray-500"
                                                    )}>
                                                        {pred.confidence}% IA CONF.
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-3 bg-white/5 rounded-2xl w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <BarChart3 className="w-6 h-6" />
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">{pred.category}</p>
                                                        <h4 className={clsx(
                                                            "text-4xl font-black italic tracking-tighter uppercase",
                                                            pred.pick === 'Over' ? "text-green-400" : "text-orange-400"
                                                        )}>
                                                            {pred.pick} {pred.line}
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-black/40 border border-white/5 p-3 rounded-2xl text-center">
                                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">PROYECTADO</p>
                                                            <p className="text-lg font-black text-white italic">{pred.projectedValue}</p>
                                                        </div>
                                                        <div className="bg-black/40 border border-white/5 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">OBJETIVO</p>
                                                            <div className="flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3 text-primary" />
                                                                <span className="text-[9px] font-black text-primary uppercase">VALOR</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs font-medium text-gray-400 leading-relaxed pr-2">
                                                        {pred.reason}
                                                    </p>
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{pred.vsAverage}</span>
                                                    <Target className="w-4 h-4 text-white/10 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PRO TOOLS: Only visible in Pro Mode */}
                                    {isProMode && (
                                        <div className="grid grid-cols-1 gap-10 mt-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                                            <div className="relative">
                                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary blur-sm"></div>
                                                <h4 className="text-4xl font-black italic uppercase tracking-tighter mb-8 pl-4">Advanced Analysis Tools</h4>
                                            </div>

                                            <PropConsistencyMatrix
                                                matches={data.lastMatches}
                                                playerName={data.player.name}
                                                sport={params.sport as string}
                                            />
                                            <KellyCalculator />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                                    <AlertTriangle className="w-20 h-20 text-yellow-500/50 mb-6" />
                                    <p className="text-xl font-black italic uppercase tracking-tighter text-gray-400">
                                        {analysis.error || "No se pudieron sincronizar las líneas de hoy."}
                                    </p>
                                    <button onClick={() => setAnalysis(null)} className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Reintentar Conexión IA
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Matches List */}
            <div className="px-4 md:px-12 max-w-7xl mx-auto pb-20 relative z-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    Historial Reciente (Full Specs)
                </h3>

                <div className="space-y-3">
                    {lastMatches && lastMatches.length > 0 ? lastMatches.slice(0, 10).map((match: any) => {
                        const stats = match.playerStats;
                        const points = stats?.points || 0;
                        const assists = stats?.assists || 0;
                        const rebounds = stats?.totalRebounds || 0;
                        const steals = stats?.steals || 0;
                        const blocks = stats?.blocks || 0;
                        const goals = stats?.goals || 0;
                        const shots = stats?.totalShots || 0;
                        const yellowCards = stats?.yellowCards || 0;

                        return (
                            <div key={match.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-6 rounded-2xl transition-all">
                                <div className="flex items-center justify-between gap-6 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-mono text-gray-500">
                                            {new Date(match.startTimestamp * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={clsx("text-sm font-bold uppercase", match.homeTeam.name === player.team?.name ? "text-white" : "text-gray-400")}>{match.homeTeam.name}</span>
                                            <span className={clsx("text-sm font-bold uppercase", match.awayTeam.name === player.team?.name ? "text-white" : "text-gray-400")}>{match.awayTeam.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black italic">{match.homeScore.current} - {match.awayScore.current}</div>
                                    </div>
                                </div>

                                {/* Player Stats Row - Basketball */}
                                {stats && points > 0 && (
                                    <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 pt-4 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-primary italic">{points}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">PTS</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-blue-400 italic">{assists}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">AST</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-green-400 italic">{rebounds}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">REB</p>
                                        </div>
                                        <div className="text-center opacity-70">
                                            <p className="text-xl font-black text-orange-400 italic">{steals}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">ROB</p>
                                        </div>
                                        <div className="text-center opacity-70">
                                            <p className="text-xl font-black text-purple-400 italic">{blocks}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">BLQ</p>
                                        </div>
                                    </div>
                                )}

                                {/* Player Stats Row - Football */}
                                {stats && (goals !== undefined || yellowCards !== undefined) && points === 0 && stats.aces === undefined && (
                                    <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 pt-4 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-primary italic">{goals}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">GOL</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-blue-400 italic">{assists}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">AST</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-green-400 italic">{shots}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">TIROS</p>
                                        </div>
                                        <div className="text-center opacity-70">
                                            <p className={clsx("text-xl font-black italic", yellowCards > 0 ? "text-yellow-400" : "text-gray-600")}>{yellowCards}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">T. AMA</p>
                                        </div>
                                    </div>
                                )}

                                {/* Player Stats Row - Tennis */}
                                {stats && stats.aces !== undefined && (
                                    <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 pt-4 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-primary italic">{stats.aces || 0}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">ACES</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-blue-400 italic">{stats.doubleFaults || 0}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">DF</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-green-400 italic">{stats.breakPointsSaved || 0}</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">BP SAVED</p>
                                        </div>
                                        <div className="text-center opacity-70">
                                            <p className="text-xl font-black text-white italic">{stats.firstServePointsWon || 0}%</p>
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">1S WON</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }) : (
                        <p className="text-gray-600 font-bold uppercase text-sm">No hay datos recientes disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
