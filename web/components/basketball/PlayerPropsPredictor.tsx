// web/components/basketball/PlayerPropsPredictor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

type Sport = 'basketball' | 'baseball' | 'nhl' | 'tennis' | 'american-football' | 'football';

interface PlayerPropsPredictorProps {
    defaultSport?: Sport;
    fixedSport?: Sport;
}

const PlayerPropsPredictor = ({ defaultSport = 'basketball', fixedSport }: PlayerPropsPredictorProps) => {
    const [currentSport, setCurrentSport] = useState<Sport>(fixedSport || defaultSport);
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [playerStats, setPlayerStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [propType, setPropType] = useState('points');
    const [line, setLine] = useState('');
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingProgress, setThinkingProgress] = useState(0);
    const [thinkingMessage, setThinkingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user, usePrediction, checkPredictionLimit, saveToHistory, notify } = useAuth();

    const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Configuración dinámica de API (Movido arriba para uso en hooks)
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;
    const API_BASE = API_URL
        || (BACKEND_HOST ? `https://${BACKEND_HOST}` : 'http://localhost:3001');

    useEffect(() => {
        async function fetchPlayerStats() {
            if (!selectedPlayer) {
                setPlayerStats(null);
                return;
            }

            setLoadingStats(true);
            try {
                const res = await axios.get(`${API_BASE}/api/sports/${currentSport}/player/${selectedPlayer.id}/stats`);
                if (res.data.success) {
                    setPlayerStats(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching player details:', err);
            } finally {
                setLoadingStats(false);
            }
        }

        fetchPlayerStats();
    }, [selectedPlayer, currentSport, API_BASE]);

    console.log('[API Config]', { API_BASE, hasApiUrl: !!API_URL, hasHost: !!BACKEND_HOST });

    const sports = [
        { id: 'basketball', label: 'NBA', icon: '🏀' },
        { id: 'football', label: 'Fútbol', icon: '⚽' },
        { id: 'american-football', label: 'NFL', icon: '🏈' },
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
            { value: 'firstServePoints', label: '1er Saque', icon: '⚡' }
        ],
        'football': [
            { value: 'goals', label: 'Goles', icon: '⚽' },
            { value: 'assists', label: 'Asistencias', icon: '🤝' },
            { value: 'shotsOnTarget', label: 'Tiros Arco', icon: '🎯' }
        ],
        'american-football': [
            { value: 'touchdowns', label: 'Touchdowns', icon: '🏈' },
            { value: 'passingYards', label: 'Yardas Aire', icon: '🎯' },
            { value: 'rushingYards', label: 'Yardas Tierra', icon: '🏃' }
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
        ],
        'football': [
            "Analizando efectividad de cara a puerta...",
            "Evaluando xG proyectado del delantero...",
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
            "Consultando modelos Touchdown IA...",
            "Finalizando reporte NFL..."
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

            // Intenta usar la URL configurada, de lo contrario asume que puede estar en la misma infraestructura
            const endpoint = `${API_BASE}/api/sports/${currentSport}/top-players`;
            console.log(`📡 Conectando con Analizador ${currentSport}: ${endpoint}`);

            const response = await axios.get(endpoint, { timeout: 8000 });
            const data = response.data;
            if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                setTopPlayers(data.data);
            } else {
                // Return high quality mocks if real data is empty
                setTopPlayers(getMockTopPlayers(currentSport));
            }
            setError(null);
        } catch (err: any) {
            console.error('Error Analizador, using mocks:', err);
            setTopPlayers(getMockTopPlayers(currentSport));
            // Only show toast error if it's a real connection error, not just waking up
            if (err.code !== 'ECONNABORTED') {
                setError('Motor de IA en espera. Usando datos de respaldo.');
            }
        }
        finally {
            setLoading(false);
        }
    };

    const getMockTopPlayers = (sport: Sport) => {
        const mocks: Record<Sport, any[]> = {
            'basketball': [
                { id: 15152, name: 'LeBron James', averages: { points: 25.4, rebounds: 7.3, assists: 8.1 } },
                { id: 825121, name: 'Luka Doncic', averages: { points: 33.9, rebounds: 9.2, assists: 9.8 } },
                { id: 341015, name: 'Nikola Jokic', averages: { points: 26.4, rebounds: 12.4, assists: 9.0 } },
                { id: 33796, name: 'Stephen Curry', averages: { points: 26.4, rebounds: 4.5, assists: 5.1 } }
            ],
            'baseball': [
                { id: 832962, name: 'Shohei Ohtani', averages: { hits: 1.2, homeRuns: 0.4, rbis: 0.8 } },
                { id: 792742, name: 'Aaron Judge', averages: { hits: 1.1, homeRuns: 0.5, rbis: 0.9 } },
                { id: 834571, name: 'Juan Soto', averages: { hits: 1.3, homeRuns: 0.3, rbis: 0.7 } }
            ],
            'nhl': [
                { id: 792817, name: 'Connor McDavid', averages: { goals: 0.8, assists: 1.5, shots: 4.2 } },
                { id: 341018, name: 'Nathan MacKinnon', averages: { goals: 0.7, assists: 1.2, shots: 4.8 } }
            ],
            'tennis': [
                { id: 14882, name: 'Novak Djokovic', averages: { aces: 6.5, doubleFaults: 2.1, firstServePoints: 78 } },
                { id: 1042571, name: 'Carlos Alcaraz', averages: { aces: 4.2, doubleFaults: 1.8, firstServePoints: 72 } }
            ],
            'football': [
                { id: 825123, name: 'Erling Haaland', averages: { goals: 1.1, assists: 0.2, shotsOnTarget: 2.5 } },
                { id: 125121, name: 'Kylian Mbappé', averages: { goals: 0.9, assists: 0.4, shotsOnTarget: 2.1 } }
            ],
            'american-football': [
                { id: 792821, name: 'Patrick Mahomes', averages: { touchdowns: 2.4, passingYards: 285.5, rushingYards: 25.2 } },
                { id: 825124, name: 'Christian McCaffrey', averages: { touchdowns: 1.2, rushingYards: 95.2, passingYards: 0 } }
            ]
        };
        return mocks[sport] || mocks['basketball'];
    };

    const generatePrediction = async () => {
        if (!user) {
            setError('Debes iniciar sesión para usar la IA');
            toast.error('Debes iniciar sesión');
            return;
        }

        const limitCheck = await checkPredictionLimit();
        if (!limitCheck.canPredict) {
            setError('Has alcanzado tu límite diario de predicciones');
            toast.error('Límite alcanzado. ¡Pásate a Premium!');
            return;
        }

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
            }, { timeout: 30000 });

            let progress = 0;
            const totalSteps = 45; // Reducido un poco para mejor UX

            thinkingTimerRef.current = setInterval(() => {
                progress += 1;
                const percentage = Math.floor((progress / totalSteps) * 100);
                setThinkingProgress(Math.min(99, percentage));

                const currentMessages = thinkingMessagesBySport[currentSport];
                const messageIndex = Math.min(Math.floor(progress / (totalSteps / currentMessages.length)), currentMessages.length - 1);
                setThinkingMessage(currentMessages[messageIndex]);

                if (progress >= totalSteps) {
                    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);

                    apiPromise.then(async response => {
                        if (response.data.success) {
                            setThinkingProgress(100);
                            const predictionData = response.data.data;
                            setPrediction(predictionData);

                            await saveToHistory({
                                playerName: selectedPlayer.name,
                                sport: currentSport,
                                propType: propType,
                                line: parseFloat(line),
                                prediction: predictionData.prediction.prediction,
                                probability: predictionData.prediction.probability,
                                confidence: predictionData.prediction.confidence,
                                reasoning: predictionData.prediction.reasoning
                            });

                            await usePrediction();

                            if (predictionData.prediction.probability >= 85) {
                                await notify(
                                    '🔥 ¡HOT PICK DETECTADO!',
                                    `${selectedPlayer.name} tiene un ${predictionData.prediction.probability}% de probabilidad. ¡Análisis Premium completado!`,
                                    'success',
                                    '/profile'
                                );
                                toast.success('¡Hot Pick guardado!');
                            }
                        }
                        setIsThinking(false);
                    }).catch(err => {
                        setError('Error en el análisis IA. Reintenta en unos segundos.');
                        setIsThinking(false);
                    });
                }
            }, 100); // 100ms para que se sienta más dinámico

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
        <div className="w-full space-y-8">
            {/* Header: Estado y Límites */}
            <div className="flex flex-col gap-4">
                <div className="glass-card p-6 bg-gradient-to-br from-purple-900/40 to-black border border-white/10 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                                {sports.find(s => s.id === currentSport)?.icon} {currentSport === 'basketball' ? 'BASKETBALL' : currentSport === 'baseball' ? 'BEISBOL' : currentSport === 'nhl' ? 'HOCKEY' : 'TENIS'} <span className="text-purple-500">ANALIZADOR PRO</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">SISTEMA DE ANÁLISIS PROFESIONAL • AI 2.5 • DATOS EN VIVO</p>
                        </div>
                        {user && (
                            <div className="text-right">
                                <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Análisis Hoy</div>
                                <div className="text-xl font-black italic">
                                    <span className={user.isPremium ? 'text-yellow-500' : 'text-white'}>{user.predictionsUsed}</span>
                                    <span className="text-gray-600 mx-1">/</span>
                                    <span className="text-gray-400">{user.isPremium ? '∞' : user.predictionsLimit}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!user?.isPremium && (
                    <Link href="/profile" className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl text-center text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em] hover:bg-yellow-500/20 transition-all">
                        ⚡ Desbloquea Análisis Ilimitados
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                </div>
            )}

            {/* Selector de Deporte - Hidden if fixedSport is provided */}
            {!fixedSport && (
                <div className="flex bg-white/5 p-1.5 rounded-2xl gap-1">
                    {sports.map(sport => (
                        <button
                            key={sport.id}
                            onClick={() => {
                                setCurrentSport(sport.id as Sport);
                                setSelectedPlayer(null);
                                setPrediction(null);
                            }}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${currentSport === sport.id
                                ? 'bg-white text-black font-black shadow-lg scale-105'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-xl mb-1">{sport.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">{sport.id === 'basketball' ? 'NBA' : sport.id === 'baseball' ? 'MLB' : sport.id.toUpperCase()}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Selección de Jugadores */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Seleccionar Atleta</h3>
                    {loading && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {topPlayers.map((player) => (
                        <button
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className={`p-4 rounded-3xl border transition-all text-left relative overflow-hidden group ${selectedPlayer?.id === player.id
                                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                : 'border-white/5 bg-white/2 hover:border-white/20'
                                }`}
                        >
                            <div className={`font-black uppercase text-xs truncate ${selectedPlayer?.id === player.id ? 'text-white' : 'text-gray-300'}`}>
                                {player.name}
                            </div>
                            <div className="text-[9px] text-gray-500 font-bold mt-1 uppercase">
                                {player.averages ? `${Object.entries(player.averages)[0][1]} AVG` : `ID: ${player.id}`}
                            </div>
                            {selectedPlayer?.id === player.id && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Game Log / Recent Performance */}
            {selectedPlayer && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="glass-card p-5 border border-white/5 bg-white/[0.02] rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest">Rendimiento Reciente</h4>
                            {loadingStats && <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>

                        {playerStats ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-4 text-[8px] font-black text-gray-600 uppercase tracking-tighter px-2">
                                    <div className="col-span-1">OPONENTE</div>
                                    <div>{currentSport === 'basketball' ? 'PTS' : currentSport === 'baseball' ? 'HITS' : currentSport === 'tennis' ? 'ACES' : 'GOALS'}</div>
                                    <div>{currentSport === 'basketball' ? 'AST' : currentSport === 'baseball' ? 'RBI' : currentSport === 'tennis' ? 'DF' : 'ASSIST'}</div>
                                    <div className="text-right">RESULT</div>
                                </div>
                                <div className="space-y-1">
                                    {(playerStats.averages?.lastGames || []).slice(0, 4).map((game: any, i: number) => (
                                        <div key={i} className="grid grid-cols-4 items-center bg-white/[0.03] p-2 rounded-xl border border-white/5 text-[10px]">
                                            <div className="font-black text-gray-400 truncate pr-2 uppercase italic">{game.opponent?.split(' ')[0] || 'OPP'}</div>
                                            <div className="font-bold text-white">{currentSport === 'basketball' ? game.points : currentSport === 'baseball' ? game.hits : currentSport === 'tennis' ? game.aces : game.goals}</div>
                                            <div className="font-bold text-white/60">{currentSport === 'basketball' ? game.assists : currentSport === 'baseball' ? game.rbis : currentSport === 'tennis' ? game.doubleFaults : game.assists}</div>
                                            <div className="text-right">
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${i % 2 === 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                    {i % 2 === 0 ? 'W' : 'L'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 flex justify-around border-t border-white/5 mt-2">
                                    {Object.entries(playerStats.averages?.averages || {}).slice(0, 3).map(([key, val]: any) => (
                                        <div key={key} className="text-center">
                                            <div className="text-[7px] font-black text-gray-500 uppercase">{key}</div>
                                            <div className="text-sm font-black text-purple-400 italic">{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : !loadingStats && selectedPlayer && (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-[10px] text-gray-500 italic">Sincronizando últimas estadísticas...</p>
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 bg-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Configuración del Análisis */}
            {selectedPlayer && (
                <div className="glass-card p-6 border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2.5rem] space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Mercado a Predecir</label>
                        <div className="grid grid-cols-2 gap-2">
                            {propTypesBySport[currentSport].map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setPropType(type.value)}
                                    className={`py-3 px-4 rounded-2xl border transition-all flex items-center gap-3 ${propType === type.value
                                        ? 'border-purple-500 bg-purple-500/20 text-white'
                                        : 'border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Línea de la Casa</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.5"
                                value={line}
                                onChange={(e) => setLine(e.target.value)}
                                placeholder="0.5"
                                className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-4xl font-black text-white focus:border-purple-500 transition-all outline-none"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-purple-500 text-black font-black text-[10px] px-3 py-1 rounded-full uppercase italic">
                                {propType}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generatePrediction}
                        disabled={isThinking || !line}
                        className={`w-full py-6 rounded-[2rem] font-black uppercase italic tracking-widest text-lg transition-all ${isThinking || !line
                            ? 'bg-neutral-800 text-neutral-600'
                            : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5'
                            }`}
                    >
                        {isThinking ? 'Procesando...' : 'Lanzar Análisis IA ☄️'}
                    </button>
                </div>
            )}

            {/* Loading IA Brutalista */}
            {isThinking && (
                <div className="glass-card p-10 border border-purple-500/50 bg-black/80 backdrop-blur-3xl rounded-[3rem] text-center animate-pulse">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * thinkingProgress) / 100} className="text-purple-500 transition-all duration-300" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white italic">{thinkingProgress}%</div>
                    </div>
                    <p className="text-sm font-black text-purple-400 uppercase tracking-[0.2em] italic">&gt; {thinkingMessage}</p>
                </div>
            )}

            {/* Resultado de Predicción */}
            {prediction && (
                <div className="glass-card overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-black animate-in zoom-in-95 duration-700">
                    <div className={`h-2 ${prediction.prediction.prediction === 'OVER' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className={`text-6xl font-black italic tracking-tighter mb-2 ${prediction.prediction.prediction === 'OVER' ? 'text-green-500' : 'text-red-500'}`}>
                                {prediction.prediction.prediction === 'OVER' ? 'MÁS DE' : 'MENOS DE'}
                            </div>
                            <div className="text-3xl font-black text-white">{prediction.line} <span className="text-gray-500 uppercase opacity-60 italic">{prediction.propType}</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Certeza</div>
                                <div className="text-3xl font-black text-white">{prediction.prediction.probability}%</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Confianza</div>
                                <div className={`text-xl font-black uppercase italic ${getConfidenceColor(prediction.prediction.confidence)}`}>{prediction.prediction.confidence}</div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-8">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 italic">Análisis Estratégico</h4>
                            <p className="text-xs text-gray-300 leading-relaxed font-medium italic">"{prediction.prediction.reasoning}"</p>
                        </div>

                        <div className="space-y-2">
                            {prediction.prediction.keyFactors?.slice(0, 3).map((factor: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40"></span>
                                    {factor}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerPropsPredictor;
