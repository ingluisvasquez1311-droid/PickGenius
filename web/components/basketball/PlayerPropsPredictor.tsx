// web/components/basketball/PlayerPropsPredictor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

type Sport = 'basketball' | 'baseball' | 'nhl' | 'tennis';

const PlayerPropsPredictor = () => {
    const [currentSport, setCurrentSport] = useState<Sport>('basketball');
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [propType, setPropType] = useState('points');
    const [line, setLine] = useState('');
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingProgress, setThinkingProgress] = useState(0);
    const [thinkingMessage, setThinkingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const sports = [
        { id: 'basketball', label: 'NBA', icon: '🏀' },
        { id: 'baseball', label: 'MLB', icon: '⚾' },
        { id: 'nhl', label: 'NHL', icon: '🏒' },
        { id: 'tennis', label: 'TENIS', icon: '🎾' }
    ];

    const propTypesBySport: Record<Sport, { value: string, label: string, icon: string }[]> = {
        'basketball': [
            { value: 'points', label: 'Puntos', icon: '🏀' },
            { value: 'assists', label: 'Asistencias', icon: '🤝' },
            { value: 'rebounds', label: 'Rebotes', icon: '💪' },
            { value: 'steals', label: 'Robos', icon: '🔒' }
        ],
        'baseball': [
            { value: 'hits', label: 'Hits', icon: '⚾' },
            { value: 'homeRuns', label: 'Home Runs', icon: '🚀' },
            { value: 'rbis', label: 'RBIs', icon: '🏃' },
            { value: 'strikeouts', label: 'Strikeouts', icon: '🔥' }
        ],
        'nhl': [
            { value: 'goals', label: 'Goles', icon: '🏒' },
            { value: 'assists', label: 'Asistencias', icon: '🤝' },
            { value: 'shots', label: 'Tiros', icon: '🎯' }
        ],
        'tennis': [
            { value: 'aces', label: 'Aces', icon: '🎾' },
            { value: 'doubleFaults', label: 'D. Faltas', icon: '❌' },
            { value: 'firstServePoints', label: '1st Serve', icon: '⚡' }
        ]
    };

    const thinkingMessagesBySport: Record<Sport, string[]> = {
        'basketball': [
            "Escaneando rotación defensiva de la NBA...",
            "Analizando eficiencia en el 'Paint'...",
            "Calculando probabilidad de triple doble...",
            "Evaluando emparejamientos individuales...",
            "Analizando fatiga por 'back-to-back'...",
            "Consultando modelos de IA especializados...",
            "Simulando 10,000 finales de posesión...",
            "Finalizando reporte NBA..."
        ],
        'baseball': [
            "Analizando ERA del pitcher abridor...",
            "Evaluando condiciones del viento en el estadio...",
            "Calculando probabilidad de Home Run...",
            "Analizando historial vs pitcheo rival...",
            "Escaneando métricas de Sabermetrics...",
            "Simulando entradas finales y bullpen...",
            "Consultando modelos Diamond IA...",
            "Finalizando reporte MLB..."
        ],
        'nhl': [
            "Evaluando efectividad del Power Play...",
            "Analizando porcentaje de paradas del goalie...",
            "Calculando tiempo en hielo (TOI)...",
            "Escaneando historial de 'Puck Line'...",
            "Analizando agresividad en el primer periodo...",
            "Simulando face-offs críticos...",
            "Consultando modelos Ice IA...",
            "Finalizando reporte NHL..."
        ],
        'tennis': [
            "Analizando efectividad del primer servicio...",
            "Evaluando rendimiento en esta superficie...",
            "Calculando resistencia en juegos largos...",
            "Escaneando historial de H2H directo...",
            "Analizando puntos de quiebre salvados...",
            "Simulando trayectoria del set definitivo...",
            "Consultando modelos Ace IA...",
            "Finalizando reporte Tenis..."
        ]
    };

    useEffect(() => {
        loadTopPlayers();
        setPropType(propTypesBySport[currentSport][0].value);
        return () => {
            if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
        };
    }, [currentSport]);

    const loadTopPlayers = async () => {
        try {
            setLoading(true);
            setTopPlayers([]);
            const response = await axios.get(`${API_BASE}/api/sports/${currentSport}/top-players`);
            if (response.data.success) {
                setTopPlayers(response.data.data);
            }
            setError(null);
        } catch (err: any) {
            setError('Error cargando jugadores: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const generatePrediction = async () => {
        if (!selectedPlayer || !line) {
            setError('Por favor selecciona un jugador y una línea');
            return;
        }

        try {
            setIsThinking(true);
            setPrediction(null);
            setThinkingProgress(0);
            setError(null);

            const apiPromise = axios.post(`${API_BASE}/api/sports/${currentSport}/predict`, {
                playerId: selectedPlayer.id,
                playerName: selectedPlayer.name,
                propType,
                line: parseFloat(line)
            });

            let progress = 0;
            const totalSteps = 60; // 60 segundos

            thinkingTimerRef.current = setInterval(() => {
                progress += 1;
                const percentage = Math.floor((progress / totalSteps) * 100);
                setThinkingProgress(percentage);

                const currentMessages = thinkingMessagesBySport[currentSport];
                const messageIndex = Math.min(Math.floor(progress / (totalSteps / currentMessages.length)), currentMessages.length - 1);
                setThinkingMessage(currentMessages[messageIndex]);

                if (progress >= totalSteps) {
                    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);

                    apiPromise.then(response => {
                        if (response.data.success) {
                            setPrediction(response.data.data);
                        }
                        setIsThinking(false);
                    }).catch(err => {
                        setError('Error generando predicción: ' + (err.response?.data?.error || err.message));
                        setIsThinking(false);
                    });
                }
            }, 1000);

        } catch (err: any) {
            setError('Error en el proceso: ' + err.message);
            setIsThinking(false);
        }
    };

    const getConfidenceColor = (conf: string) => {
        if (conf === 'Alta') return 'text-green-400';
        if (conf === 'Media') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="w-full space-y-6">
            {/* Header Multi-Deporte */}
            <div className="glass-card p-2 bg-black/40 border border-white/5 rounded-2xl flex gap-1">
                {sports.map(sport => (
                    <button
                        key={sport.id}
                        onClick={() => {
                            setCurrentSport(sport.id as Sport);
                            setSelectedPlayer(null);
                            setPrediction(null);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${currentSport === sport.id
                            ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                    >
                        <span className="text-lg">{sport.icon}</span>
                        <span className="hidden md:inline">{sport.label}</span>
                    </button>
                ))}
            </div>

            <div className="glass-card p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[rgba(255,255,255,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[var(--primary)]/20 transition-all duration-700"></div>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <span className="animate-pulse">{sports.find(s => s.id === currentSport)?.icon}</span> {currentSport.toUpperCase()} PRO ANALYZER
                </h2>
                <p className="text-[var(--text-muted)] text-sm font-medium tracking-wide">
                    SISTEMA DE ANÁLISIS MULTI-DEPORTE • SOFASCORE • AI 2.0
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in">
                    <span className="text-2xl">🚨</span>
                    <span className="font-semibold">{error}</span>
                </div>
            )}

            {/* Selector de Jugadores Premium */}
            <div className="glass-card p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                    <span className="text-[var(--primary)]">⭐</span> TOP PLAYERS {currentSport}
                </h3>

                {loading && !topPlayers.length ? (
                    <div className="flex flex-col items-center py-12">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/20"></div>
                            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--primary)] animate-spin"></div>
                        </div>
                        <p className="mt-6 text-[var(--text-muted)] font-bold animate-pulse uppercase tracking-widest text-xs">Conectando con SofaScore...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topPlayers.map((player) => (
                            <button
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={`p-4 rounded-2xl transition-all duration-300 border text-left group relative overflow-hidden ${selectedPlayer?.id === player.id
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                                    : 'border-white/5 hover:border-[var(--primary)]/40 bg-white/2 hover:bg-white/5'
                                    }`}
                            >
                                <div className="font-black text-white text-sm mb-1 group-hover:text-[var(--primary)] transition-colors">{player.name}</div>
                                {player.averages && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Object.entries(player.averages).slice(0, 2).map(([key, val]: [any, any]) => (
                                            <div key={key} className="text-[9px] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                                <span className="text-[var(--text-muted)] uppercase mr-1">{key}</span>
                                                <span className="text-white font-bold">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Formulario de Análisis Avanzado */}
            {selectedPlayer && (
                <div className="glass-card p-8 border-l-4 border-[var(--primary)] bg-gradient-to-r from-white/[0.02] to-transparent">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        🎯 ANALIZAR {currentSport.toUpperCase()}: <span className="text-[var(--primary)]">{selectedPlayer.name.toUpperCase()}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Mercado Proyectado</label>
                            <div className="grid grid-cols-2 gap-2">
                                {propTypesBySport[currentSport].map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setPropType(type.value)}
                                        className={`py-3 px-4 rounded-xl border-2 text-[10px] transition-all duration-300 flex flex-col items-center gap-1 ${propType === type.value
                                            ? 'border-[var(--primary)] bg-[var(--primary)]/30 text-white scale-105 shadow-lg font-black'
                                            : 'border-white/5 text-[var(--text-muted)] hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-xl">{type.icon}</span>
                                        <span>{type.label.toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Línea de la Casa</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={line}
                                    onChange={(e) => setLine(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-white text-4xl font-black focus:border-[var(--primary)] focus:outline-none transition-all placeholder:text-white/5"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--primary)] font-black text-xs tracking-tighter bg-black/40 px-3 py-1 rounded-full border border-[var(--primary)]/30">
                                    {propType.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={generatePrediction}
                                disabled={isThinking || !line}
                                className={`w-full py-6 rounded-2xl font-black text-black text-lg transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-1 ${isThinking || !line
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.03] active:scale-[0.97]'
                                    }`}
                            >
                                <span className="uppercase tracking-widest font-black">
                                    {isThinking ? 'PROCESADO...' : 'ANALIZAR CON IA'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pantalla de Carga IA Brutal */}
            {isThinking && (
                <div className="glass-card p-12 border-2 border-[var(--primary)]/30 bg-black/60 backdrop-blur-xl rounded-[2rem] text-center">
                    <div className="relative w-32 h-32 mx-auto mb-10">
                        <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)]/10"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-[var(--primary)] animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black text-white">{thinkingProgress}%</span>
                        </div>
                    </div>

                    <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.2em]">Ejecutando Engine Predictivo</h4>
                    <p className="text-[var(--primary)] font-bold text-lg h-8 animate-pulse italic">
                        &gt; {thinkingMessage}
                    </p>
                    <div className="w-full bg-white/5 h-2 rounded-full mt-10 overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500" style={{ width: `${thinkingProgress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Resultado de Predicción Brutal */}
            {prediction && (
                <div className="glass-card overflow-hidden animate-in slide-in-from-bottom-10 duration-1000 rounded-[2.5rem] border border-white/10">
                    <div className={`h-3 ${prediction.prediction.prediction === 'OVER' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="p-10">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="lg:w-2/5 flex flex-col items-center justify-center p-10 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center">
                                <div className="text-7xl mb-4 font-black">
                                    {prediction.prediction.prediction === 'OVER' ? '📈' : '📉'}
                                </div>
                                <div className={`text-7xl font-black mb-4 ${prediction.prediction.prediction === 'OVER' ? 'text-green-500' : 'text-red-500'}`}>
                                    {prediction.prediction.prediction}
                                </div>
                                <div className="text-white text-2xl font-black mb-4">{prediction.line} {prediction.propType.toUpperCase()}</div>
                                <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <div className="text-[10px] text-white/40 uppercase font-black mb-2">Probabilidad</div>
                                        <div className="text-4xl font-black text-white">{prediction.prediction.probability}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <div className="text-[10px] text-white/40 uppercase font-black mb-2">Confianza</div>
                                        <div className={`text-3xl font-black ${getConfidenceColor(prediction.prediction.confidence)}`}>{prediction.prediction.confidence.toUpperCase()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-3/5 space-y-10">
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-widest mb-6">INFORME DE ANÁLISIS</h4>
                                    <div className="bg-white/2 p-8 rounded-[1.5rem] border border-white/5">
                                        <p className="text-white/80 leading-relaxed text-lg font-medium italic">"{prediction.prediction.reasoning}"</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[var(--primary)] font-black uppercase text-xs tracking-[0.3em]">FACTORES CLAVE</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {prediction.prediction.keyFactors?.map((factor: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border-l-4 border-[var(--primary)]">
                                                <span className="text-white font-bold text-sm">{factor.toUpperCase()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Game Log */}
                        <div className="mt-16">
                            <h4 className="text-white font-black uppercase text-sm tracking-[0.4em] mb-8">📊 HISTORIAL RECIENTE SOFASCORE</h4>
                            <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-white/2">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="p-6 text-left font-black text-white/40">FECHA</th>
                                            <th className="p-6 text-left font-black text-white/40">OPONENTE</th>
                                            {Object.keys(prediction.averages).map(key => (
                                                <th key={key} className="p-6 text-center font-black text-white/40 uppercase">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {prediction.lastGames?.map((game: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-6 text-white/60 font-bold">{new Date(game.date).toLocaleDateString('es-ES').toUpperCase()}</td>
                                                <td className="p-6 text-white font-black">{game.opponent.toUpperCase()}</td>
                                                {Object.keys(prediction.averages).map(key => (
                                                    <td key={key} className="p-6 text-center">
                                                        <span className={`px-3 py-1 rounded-lg font-black ${game[key] >= parseFloat(line) && propType === key ? 'bg-green-500 text-black' : 'text-white/80'}`}>
                                                            {game[key]}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerPropsPredictor;
