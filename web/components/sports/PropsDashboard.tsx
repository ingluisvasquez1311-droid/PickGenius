'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import TeamLogo from '@/components/ui/TeamLogo';
import ShareButton from '@/components/sharing/ShareButton';

interface PlayerProp {
    id: string;
    player: {
        id: number;
        name: string;
        team: string;
        position?: string;
        image?: string;
    };
    game: {
        id: number;
        homeTeam: string;
        awayTeam: string;
        homeTeamId: number;
        awayTeamId: number;
        date: string;
        startTimestamp: number;
    };
    prop: {
        type: string;
        line: number;
        displayName: string;
        icon: string;
    };
    stats: {
        average: number;
        last5: number[];
        trend: '📈' | '📉';
    };
    prediction?: any;
    league: string;
    sport: string;
}

const PropsDashboard = () => {
    const [sport, setSport] = useState('basketball');
    const [props, setProps] = useState<PlayerProp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'all' | 'picks' | 'parlays'>('all');

    // Status para IA
    const [isPredicting, setIsPredicting] = useState<string | null>(null);
    const { user, usePrediction, checkPredictionLimit, saveToHistory, notify } = useAuth();

    const [thinkingProgress, setThinkingProgress] = useState(0);
    const [thinkingMessage, setThinkingMessage] = useState('');
    const thinkingTimerRef = useRef<any>(null);

    const thinkingMessagesBySport: any = {
        'basketball': [
            "Escaneando rotación defensiva de la NBA...",
            "Analizando eficiencia en el 'Paint'...",
            "Calculando probabilidad de triple doble...",
            "Evaluando emparejamientos individuales...",
            "Consultando modelos de IA especializados...",
            "Simulando 10,000 finales de posesión...",
            "Finalizando reporte NBA..."
        ],
        'baseball': [
            "Analizando ERA del pitcher abridor...",
            "Evaluando condiciones del viento...",
            "Calculando probabilidad de Home Run...",
            "Analizando historial vs pitcheo rival...",
            "Escaneando métricas Sabermetrics...",
            "Consultando modelos Diamond IA...",
            "Finalizando reporte MLB..."
        ],
        'nhl': [
            "Evaluando efectividad del Power Play...",
            "Analizando porcentaje de paradas del goalie...",
            "Calculando tiempo en hielo (TOI)...",
            "Escaneando historial de 'Puck Line'...",
            "Simulando face-offs críticos...",
            "Consultando modelos Ice IA...",
            "Finalizando reporte NHL..."
        ],
        'tennis': [
            "Analizando efectividad del primer servicio...",
            "Evaluando rendimiento en esta superficie...",
            "Calculando resistencia en juegos largos...",
            "Escaneando historial de H2H directo...",
            "Simulando trayectoria del set definitivo...",
            "Consultando modelos Ace IA...",
            "Finalizando reporte Tenis..."
        ],
        'football': [
            "Analizando efectividad de cara a puerta...",
            "Evaluando xG proyectado...",
            "Calculando probabilidad de asistencia...",
            "Escaneando defensas rivales...",
            "Simulando transiciones ofensivas...",
            "Consultando modelos Goal IA...",
            "Finalizando reporte Fútbol..."
        ],
        'american-football': [
            "Analizando yardas por pase proyectadas...",
            "Evaluando probabilidad de Touchdown...",
            "Calculando protección de la O-Line...",
            "Escaneando debilidades de la secundaria...",
            "Simulando posesiones en Red Zone...",
            "Consultando modelos NFL IA...",
            "Finalizando reporte NFL..."
        ]
    };

    const sports = [
        { id: 'basketball', name: 'NBA', icon: '🏀', color: 'blue' },
        { id: 'football', name: 'Fútbol', icon: '⚽', color: 'green' },
        { id: 'american-football', name: 'NFL', icon: '🏈', color: 'orange' },
        { id: 'baseball', name: 'MLB', icon: '⚾', color: 'red' },
        { id: 'nhl', name: 'NHL', icon: '🏒', color: 'blue' },
        { id: 'tennis', name: 'Tenis', icon: '🎾', color: 'yellow' }
    ];

    useEffect(() => {
        loadProps();
        return () => {
            if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
        };
    }, [sport]);

    const loadProps = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/props/daily?sport=${sport}`);
            if (res.data.success) {
                setProps(res.data.data);
            }
        } catch (error) {
            console.error('Error loading props:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async (prop: PlayerProp) => {
        if (!user) {
            toast.error('Debes iniciar sesión para usar la IA');
            return;
        }

        if (isPredicting) return;

        // Verificar límites
        const limitCheck = await checkPredictionLimit();
        if (!limitCheck.canPredict) {
            toast.error('Has alcanzado tu límite diario de predicciones');
            return;
        }

        setIsPredicting(prop.id);
        setThinkingProgress(0);

        try {
            const apiPromise = axios.post('/api/props/predict', prop);

            let progress = 0;
            const totalSteps = 600; // 60 segundos

            thinkingTimerRef.current = setInterval(() => {
                progress += 1;
                const percentage = Math.floor((progress / totalSteps) * 100);
                setThinkingProgress(Math.min(99, percentage));

                const currentMessages = thinkingMessagesBySport[prop.sport] || thinkingMessagesBySport['basketball'];
                const messageIndex = Math.min(Math.floor(progress / (totalSteps / currentMessages.length)), currentMessages.length - 1);
                setThinkingMessage(currentMessages[messageIndex]);

                if (progress >= totalSteps) {
                    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);

                    apiPromise.then(async res => {
                        if (res.data.success) {
                            setThinkingProgress(100);
                            const predictionData = res.data.data;
                            setProps(prev => prev.map(p =>
                                p.id === prop.id ? { ...p, prediction: predictionData } : p
                            ));

                            // Guardar en el historial
                            await saveToHistory({
                                playerName: prop.player.name,
                                sport: prop.sport,
                                propType: prop.prop.type,
                                line: prop.prop.line,
                                prediction: predictionData.prediction,
                                probability: predictionData.probability,
                                confidence: predictionData.confidence,
                                reasoning: predictionData.reasoning
                            });

                            // Incrementar contador de uso
                            await usePrediction();

                            // Notificar si es un Hot Pick (Probabilidad >= 75%)
                            if (predictionData.probability >= 75) {
                                await notify(
                                    predictionData.probability >= 85 ? '🔥 ¡HOT PICK DETECTADO!' : '🎯 RECOMENDACIÓN IA',
                                    `${prop.player.name} tiene un ${predictionData.probability}% de probabilidad en ${prop.prop.displayName}.`,
                                    predictionData.probability >= 85 ? 'success' : 'info',
                                    '/props'
                                );
                                toast.success(predictionData.probability >= 85 ? '¡Hot Pick guardado!' : 'Predicción analizada');
                            }
                        }
                        setIsPredicting(null);
                    }).catch(err => {
                        console.error('Error predicting:', err);
                        toast.error('Error al generar la predicción');
                        setIsPredicting(null);
                    });
                }
            }, 100);

        } catch (error) {
            console.error('Error predicting:', error);
            toast.error('Error al generar la predicción');
            setIsPredicting(null);
        }
    };

    const filteredProps = props.filter(p =>
        p.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.player.team.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPicks = () => props.filter(p => p.prediction && p.prediction.probability >= 70)
        .sort((a, b) => (b.prediction?.probability || 0) - (a.prediction?.probability || 0));

    const getParlays = () => {
        const topPicks = getPicks().slice(0, 10);
        const parlays = [];

        // Generar combinaciones de 2 picks (Dupletas)
        for (let i = 0; i < topPicks.length; i++) {
            for (let j = i + 1; j < Math.min(i + 4, topPicks.length); j++) {
                const pick1 = topPicks[i];
                const pick2 = topPicks[j];

                // Solo si son de partidos diferentes para mayor seguridad
                if (pick1.game.id !== pick2.game.id) {
                    parlays.push({
                        id: `parlay-2-${pick1.id}-${pick2.id}`,
                        type: 'Dupleta PRO',
                        picks: [pick1, pick2],
                        totalProbability: Math.round((pick1.prediction.probability * pick2.prediction.probability) / 100),
                        confidence: pick1.prediction.probability > 85 && pick2.prediction.probability > 85 ? 'Muy Alta' : 'Alta'
                    });
                }
            }
        }

        return parlays.slice(0, 6); // Top 6 combinadas
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
            {/* Sport Selector Chips */}
            <div className="flex flex-wrap gap-3 justify-center">
                {sports.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSport(s.id)}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 border-2 ${sport === s.id
                            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105'
                            : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{s.icon}</span>
                        {s.name.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Main Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-2xl max-w-md mx-auto border border-white/10">
                <button
                    onClick={() => setView('all')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'all' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'}`}
                >
                    MERCADOS
                </button>
                <button
                    onClick={() => setView('picks')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'picks' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'}`}
                >
                    MEJORES PICKS
                </button>
                <button
                    onClick={() => setView('parlays')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'parlays' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'}`}
                >
                    COMBINADAS
                </button>
            </div>

            {/* Info de Límites */}
            {user && (
                <div className="flex justify-center">
                    <div className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Predicciones hoy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${user.isPremium ? 'text-yellow-500' : 'text-white'}`}>
                                {user.predictionsUsed}
                            </span>
                            <span className="text-gray-600 text-[10px] font-bold">/</span>
                            <span className="text-gray-400 text-xs font-bold">
                                {user.isPremium ? '∞' : user.predictionsLimit}
                            </span>
                        </div>
                        {!user.isPremium && (
                            <Link href="/profile" className="text-[9px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest border-l border-white/10 pl-4 ml-2">
                                Subir a Premium ✨
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            {view === 'all' && (
                <div className="relative max-w-2xl mx-auto group">
                    <input
                        type="text"
                        placeholder="BUSCAR JUGADOR O EQUIPO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">🔍</div>
                </div>
            )}

            {/* AI Top Pick Section */}
            {!loading && view === 'all' && props.some(p => p.prediction) && (
                <div className="max-w-4xl mx-auto mb-12 animate-in zoom-in duration-700">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <span className="text-xl">🏆</span>
                        <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">IA Top Pick del Día</h2>
                    </div>
                    {(() => {
                        const topPick = (props || [])
                            .filter(p => p && p.prediction)
                            .sort((a, b) => ((b.prediction?.probability || 0)) - ((a.prediction?.probability || 0)))[0];

                        if (!topPick) return null;

                        return (
                            <div className="premium-border rounded-[2.5rem] overflow-hidden">
                                <div className="glass-brutal bg-gradient-to-br from-purple-600/20 to-black/40 p-8 flex flex-col md:flex-row items-center gap-8 border border-white/10">
                                    <div className="relative shrink-0">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-black/40 border-2 border-purple-500/30 p-1 overflow-hidden shadow-2xl">
                                            {topPick.player.image ? (
                                                <img src={topPick.player.image} alt={topPick.player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-purple-500/20 text-2xl">👤</div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl">
                                            {(topPick.prediction?.probability || 0)}% PROB
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                            <span className="text-purple-400 font-bold text-[10px] uppercase tracking-widest">{topPick.sport} / {topPick.league}</span>
                                            <div className="flex -space-x-1">
                                                <div className="w-5 h-5 rounded-full border border-white/10 bg-black/50 overflow-hidden"><TeamLogo teamId={topPick.game.homeTeamId} teamName={topPick.game.homeTeam} size="sm" /></div>
                                                <div className="w-5 h-5 rounded-full border border-white/10 bg-black/50 overflow-hidden"><TeamLogo teamId={topPick.game.awayTeamId} teamName={topPick.game.awayTeam} size="sm" /></div>
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                                            {topPick.player.name} <span className="text-purple-500">MÁS DE {topPick.prop.line}</span>
                                        </h3>
                                        <p className="text-xs text-white/60 font-medium italic leading-relaxed">
                                            "{topPick.prediction.reasoning}"
                                        </p>
                                    </div>

                                    <div className="shrink-0 flex flex-col gap-2">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                            <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Confianza</div>
                                            <div className="text-xl font-black text-purple-400 uppercase italic">{topPick.prediction.confidence}</div>
                                        </div>
                                        <div className="text-[10px] font-black text-center text-white p-2 animate-pulse">
                                            🔥 HOT PICK
                                        </div>
                                    </div>

                                    {/* Share Button for Top Pick */}
                                    <div className="absolute top-4 right-4">
                                        <ShareButton data={{
                                            player: {
                                                name: topPick.player.name,
                                                team: topPick.player.team,
                                                image: topPick.player.image
                                            },
                                            match: {
                                                homeTeam: topPick.game.homeTeam,
                                                awayTeam: topPick.game.awayTeam,
                                                time: new Date(topPick.game.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                tournament: topPick.league
                                            },
                                            prediction: {
                                                type: topPick.prop.displayName,
                                                line: topPick.prop.line,
                                                prediction: topPick.prediction.prediction,
                                                probability: topPick.prediction.probability
                                            }
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {
                loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 glass-card animate-pulse bg-white/5"></div>
                        ))}
                    </div>
                ) : view === 'parlays' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {getParlays().length > 0 ? (
                            getParlays().map(parlay => (
                                <ParlayCard key={parlay.id} parlay={parlay} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 opacity-30">
                                <div className="text-5xl mb-4">🔮</div>
                                <p className="font-black uppercase tracking-widest text-xs">Analiza más jugadores para generar combinadas</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.values(
                            (props || []).length > 0 ? (
                                (view === 'all' ? filteredProps : getPicks()).reduce((acc, prop) => {
                                    if (!prop || !prop.player) return acc;
                                    const playerId = prop.player.id;
                                    if (!acc[playerId]) acc[playerId] = { player: prop.player, game: prop.game, props: [] };
                                    acc[playerId].props.push(prop);
                                    return acc;
                                }, {} as Record<number, { player: any, game: any, props: PlayerProp[] }>)
                            ) : {}
                        ).map(group => (
                            <PlayerGroup
                                key={group.player.id}
                                group={group}
                                onPredict={handlePredict}
                                isPredicting={isPredicting}
                                thinkingProgress={thinkingProgress}
                                thinkingMessage={thinkingMessage}
                            />
                        ))}
                    </div>
                )
            }

            {
                !loading && (view === 'all' ? filteredProps : (view === 'parlays' ? getParlays() : getPicks())).length === 0 && (
                    <div className="text-center py-20 px-4">
                        <div className="text-6xl mb-4 opacity-20">📭</div>
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No hay props disponibles</h3>
                        <p className="text-gray-500 max-w-md mx-auto text-sm">
                            Actualmente no hemos encontrado mercados de jugadores para este deporte.
                            Inténtalo más tarde o revisa otro deporte para obtener predicciones.
                        </p>
                    </div>
                )
            }
        </div >
    );
};

const Sparkline = ({ data, color = "#a855f7" }: { data: number[], color?: string }) => {
    const chartData = data.map((val, i) => ({ val, i }));
    return (
        <div className="h-10 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={3}
                        dot={false}
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const PlayerGroup = ({
    group,
    onPredict,
    isPredicting,
    thinkingProgress,
    thinkingMessage
}: {
    group: { player: any, game: any, props: PlayerProp[] },
    onPredict: (prop: PlayerProp) => void,
    isPredicting: string | null,
    thinkingProgress: number,
    thinkingMessage: string
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="glass-card bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-white/10">
            {/* Player Header - Always Visible */}
            <div
                className="p-8 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-black/40 border border-white/10 p-1 shrink-0 overflow-hidden shadow-2xl relative group-hover:scale-110 transition-transform duration-500">
                        {group.player.image ? (
                            <img src={group.player.image} alt={group.player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-xl">👤</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                            <div className="w-6 h-6"><TeamLogo teamId={group.game.homeTeam === group.player.team ? group.game.homeTeamId : group.game.awayTeamId} teamName={group.player.team} size="sm" /></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-0">{group.player.name}</h3>
                            <div className="flex items-center -space-x-2">
                                <div className="w-6 h-6 rounded-full border border-white/10 bg-black/50 overflow-hidden" title={group.game.homeTeam}><TeamLogo teamId={group.game.homeTeamId} teamName={group.game.homeTeam} size="sm" /></div>
                                <div className="w-6 h-6 rounded-full border border-white/10 bg-black/50 overflow-hidden" title={group.game.awayTeam}><TeamLogo teamId={group.game.awayTeamId} teamName={group.game.awayTeam} size="sm" /></div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 w-fit">{group.player.team}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white/30 uppercase">VS {group.game.homeTeam === group.player.team ? group.game.awayTeam : group.game.homeTeam}</span>
                                <span className="text-[10px] font-mono text-purple-400/50 uppercase tracking-tighter">
                                    • {new Date(group.game.startTimestamp * 1000).toLocaleDateString([], { day: 'numeric', month: 'short' })} {new Date(group.game.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Mercados Disponibles</div>
                        <div className="text-xl font-black text-white">{group.props.length} <span className="text-xs text-purple-400">PROPS</span></div>
                    </div>
                    <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-white text-black' : 'bg-white/5'}`}>
                        {isExpanded ? '↑' : '↓'}
                    </div>
                </div>
            </div>

            {/* Markets Content - Conditional */}
            {isExpanded && (
                <div className="p-8 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                        {group.props.map(prop => (
                            <div key={prop.id} className="bg-white/5 border border-white/5 rounded-3xl p-5 hover:bg-white/[0.08] transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{prop.prop.icon}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{prop.prop.displayName}</span>
                                    </div>
                                    <div className="text-2xl font-black text-white italic">{prop.prop.line}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 group/stat">
                                        <div className="text-[7px] text-gray-500 font-black uppercase mb-1">PROMEDIO</div>
                                        <div className="text-xs font-black text-white">{prop.stats.average.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 group/stat">
                                        <div className="text-[7px] text-gray-500 font-black uppercase mb-1">TENDENCIA</div>
                                        <div className="text-xs font-black text-white">{prop.stats.trend}</div>
                                    </div>
                                </div>

                                <div className="mb-6 px-1">
                                    <Sparkline data={prop.stats.last5} color={prop.stats.trend === '📈' ? '#10b981' : '#ef4444'} />
                                </div>

                                {prop.prediction ? (
                                    <div className={`p-4 rounded-2xl border-2 relative overflow-hidden group/pred ${['OVER', 'HOME', 'YES'].includes(prop.prediction.prediction) ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                        <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-20 -mr-8 -mt-8 ${['OVER', 'HOME', 'YES'].includes(prop.prediction.prediction) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <div className="flex justify-between items-center mb-1 relative z-10">
                                            <span className={`text-[10px] font-black tracking-tighter uppercase ${['OVER', 'HOME', 'YES'].includes(prop.prediction.prediction) ? 'text-green-500' : 'text-red-500'}`}>
                                                {prop.prediction.prediction === 'OVER' ? 'MÁS DE' :
                                                    prop.prediction.prediction === 'UNDER' ? 'MENOS DE' :
                                                        prop.prediction.prediction}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full opacity-60 ${['OVER', 'HOME', 'YES'].includes(prop.prediction.prediction) ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${prop.prediction.probability}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-white">{prop.prediction.probability}%</span>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-white/40 italic line-clamp-1 relative z-10">"{prop.prediction.reasoning}"</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onPredict(prop)}
                                        disabled={!!isPredicting}
                                        className={`w-full py-4 rounded-2xl font-black text-[9px] tracking-widest transition-all relative overflow-hidden ${isPredicting === prop.id ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-white text-black hover:scale-105'}`}
                                    >
                                        {isPredicting === prop.id ? (
                                            <>
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-purple-500/20 transition-all duration-300"
                                                    style={{ width: `${thinkingProgress}%` }}
                                                ></div>
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <span className="animate-pulse">{thinkingProgress}% ANALIZANDO...</span>
                                                    <span className="text-[7px] text-white/40 lowercase italic mt-0.5 truncate max-w-full px-2">{thinkingMessage}</span>
                                                </div>
                                            </>
                                        ) : '🤖 IA ANALYZE'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PropCard = ({ prop, onPredict, isPredicting }: { prop: PlayerProp, onPredict: () => void, isPredicting: boolean }) => {

    return (
        <div className="glass-card p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 transition-all duration-500 group relative flex flex-col items-stretch h-full overflow-hidden">
            {/* Background Image Blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-700"></div>

            {/* Player Header */}
            <div className="flex items-start gap-4 mb-6 z-10">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 p-1 shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    <img src={prop.player.image} alt={prop.player.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-sm truncate uppercase tracking-tighter group-hover:text-purple-400 transition-colors">
                        {prop.player.name}
                    </div>
                    <div className="text-[10px] text-white/40 font-bold uppercase truncate">{prop.player.team}</div>
                    <div className="text-[9px] text-white/30 font-bold mt-1 uppercase tracking-tighter truncate">
                        vs {prop.game.homeTeam === prop.player.team ? prop.game.awayTeam : prop.game.homeTeam}
                    </div>
                </div>
            </div>

            {/* Market & Line */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5 group-hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{prop.prop.icon}</span>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                            {prop.prop.displayName}
                        </span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">
                        {prop.prop.line}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <div className="text-[8px] text-white/30 font-black uppercase mb-1">Promedio</div>
                    <div className="text-xl font-black text-white">{prop.stats.average.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <div className="text-[8px] text-white/30 font-black uppercase mb-1">Tendencia</div>
                    <div className="text-xl font-black text-white flex items-center justify-between">
                        {prop.stats.trend}
                        <span className="text-[9px] text-white/20">Ú5</span>
                    </div>
                </div>
            </div>

            {/* Last 5 History */}
            <div className="flex gap-1 mb-6">
                {prop.stats.last5.map((val, i) => (
                    <div
                        key={i}
                        className={`flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-black border transition-all ${val >= prop.prop.line
                            ? 'bg-green-500/20 text-green-400 border-green-500/20'
                            : 'bg-red-500/20 text-red-400 border-red-500/20'
                            }`}
                    >
                        {val}
                    </div>
                ))}
            </div>

            {/* Prediction / Button */}
            <div className="mt-auto pt-4 border-t border-white/5">
                {prop.prediction ? (
                    <div className={`p-4 rounded-2xl border-2 animate-in zoom-in slide-in-from-bottom-2 ${prop.prediction.prediction === 'OVER' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                        }`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xl font-black ${prop.prediction.prediction === 'OVER' ? 'text-green-500' : 'text-red-500'}`}>
                                {prop.prediction.prediction === 'OVER' ? 'MÁS DE' : 'MENOS DE'}
                            </span>
                            <span className="text-sm font-black text-white/80">{prop.prediction.probability}%</span>
                        </div>
                        <p className="text-[9px] text-white/60 leading-tight italic line-clamp-2">
                            "{prop.prediction.reasoning}"
                        </p>

                        <div className="absolute top-2 right-2">
                            <ShareButton data={{
                                player: {
                                    name: prop.player.name,
                                    team: prop.player.team,
                                    image: prop.player.image
                                },
                                match: {
                                    homeTeam: prop.game.homeTeam,
                                    awayTeam: prop.game.awayTeam,
                                    time: new Date(prop.game.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    tournament: prop.league
                                },
                                prediction: {
                                    type: prop.prop.displayName,
                                    line: prop.prop.line,
                                    prediction: prop.prediction.prediction,
                                    probability: prop.prediction.probability
                                }
                            }} />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onPredict}
                        disabled={isPredicting}
                        className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all shadow-xl shadow-black/20 relative overflow-hidden ${isPredicting ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:scale-105 active:scale-95'
                            }`}
                    >
                        {isPredicting && (
                            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                        )}
                        {isPredicting ? 'ANALIZANDO...' : '🤖 PREDECIR CON IA'}
                    </button>
                )}
            </div>
        </div>
    );
};

const ParlayCard = ({ parlay }: { parlay: any }) => {
    return (
        <div className="glass-card bg-gradient-to-br from-purple-900/40 to-black/40 border border-purple-500/20 rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4">
                <div className="bg-purple-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20">
                    {parlay.type}
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-2xl">
                        🎟️
                    </div>
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-40 mb-1">Confianza Combinada</h4>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white tracking-tighter">{parlay.totalProbability}%</span>
                            <span className="text-purple-400 text-[10px] font-black uppercase mb-1.5 tracking-widest">{parlay.confidence}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {parlay.picks.map((pick: any, idx: number) => (
                        <div key={idx} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 p-1 shrink-0">
                                {pick.player.image ? (
                                    <img src={pick.player.image} alt={pick.player.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[8px]">👤</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-black text-[10px] uppercase truncate">{pick.player.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[14px]">{pick.prop.icon}</span>
                                    <span className="text-white/40 text-[9px] font-bold uppercase truncate">{pick.prop.displayName} {pick.prop.line}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${pick.prediction.prediction === 'OVER' ? 'text-green-500' : 'text-red-500'}`}>
                                    {pick.prediction.prediction === 'OVER' ? 'MÁS' : 'MENOS'}
                                </span>
                                <p className="text-[9px] text-white/20 font-bold">{pick.prediction.probability}%</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest italic">Análisis IA Finalizado</div>
                    <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all">
                        Compartir Pick
                    </button>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
        </div>
    );
};

export default PropsDashboard;
