// web/components/basketball/PlayerPropsPredictor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import PlayerPredictionShowcase from '@/components/ai/PlayerPredictionShowcase';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity, Zap, Brain, Target, Star, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/api';

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

    useEffect(() => {
        async function fetchPlayerStats() {
            if (!selectedPlayer) {
                setPlayerStats(null);
                return;
            }

            setLoadingStats(true);
            try {
                const res = await axios.get(`${API_URL}/api/sports/${currentSport}/player/${selectedPlayer.id}/stats`);
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
    }, [selectedPlayer, currentSport]);

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
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' },
            { value: 'totalPoints', label: 'Total Puntos', icon: '📊' }
        ],
        'baseball': [
            { value: 'hits', label: 'Hits', icon: '⚾' },
            { value: 'homeRuns', label: 'Home Runs', icon: '🚀' },
            { value: 'strikeouts', label: 'Strikeouts', icon: '🔥' },
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' }
        ],
        'nhl': [
            { value: 'goals', label: 'Goles', icon: '🏒' },
            { value: 'shots', label: 'Tiros', icon: '🎯' },
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' },
            { value: 'totalGoals', label: 'Total Goles', icon: '📊' }
        ],
        'tennis': [
            { value: 'aces', label: 'Aces', icon: '🎾' },
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' },
            { value: 'gameWinner', label: 'Ganador Juego', icon: '🎮' }
        ],
        'football': [
            { value: 'goals', label: 'Goles', icon: '⚽' },
            { value: 'shotsOnTarget', label: 'Remates a puerta', icon: '🎯' },
            { value: 'assists', label: 'Asistencias', icon: '🤝' },
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' }
        ],
        'american-football': [
            { value: 'touchdowns', label: 'Touchdowns', icon: '🏈' },
            { value: 'passingYards', label: 'Yardas Aire', icon: '🎯' },
            { value: 'rushingYards', label: 'Yardas Carrera', icon: '🏃' },
            { value: 'receivingYards', label: 'Yardas Rec.', icon: '👐' },
            { value: 'winner', label: 'Ganador (ML)', icon: '🏆' }
        ]
    };

    const thinkingMessagesBySport: Record<Sport, string[]> = {
        'basketball': ["Escaneando rotación defensiva...", "Analizando eficiencia...", "Calculando probabilidad...", "Simulando finales...", "Finalizando reporte NBA..."],
        'baseball': ["Analizando ERA...", "Evaluando viento...", "Calculando HR...", "Finalizando reporte MLB..."],
        'nhl': ["Evaluando Power Play...", "Analizando paradas...", "Calculando TOI...", "Finalizando reporte NHL..."],
        'tennis': ["Analizando servicio...", "Evaluando superficie...", "Calculando resistencia...", "Finalizando reporte Tenis..."],
        'football': ["Analizando xG...", "Evaluando asistencias...", "Finalizando reporte Fútbol..."],
        'american-football': ["Analizando yardas...", "Evaluando TD...", "Finalizando reporte NFL..."]
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
            const response = await axios.get(`${API_URL}/api/sports/${currentSport}/top-players`, { timeout: 8000 });
            if (response.data && response.data.success && response.data.data.length > 0) {
                setTopPlayers(response.data.data);
            } else {
                setTopPlayers(getMockTopPlayers(currentSport));
            }
            setError(null);
        } catch (err: any) {
            setTopPlayers(getMockTopPlayers(currentSport));
            if (err.code !== 'ECONNABORTED') setError('Motor de IA en espera. Usando datos de respaldo.');
        } finally {
            setLoading(false);
        }
    };

    const getMockTopPlayers = (sport: Sport) => {
        const mocks: Record<Sport, any[]> = {
            'basketball': [
                { id: 15152, name: 'LeBron James', averages: { points: 25.4, rebounds: 7.3, assists: 8.1 } },
                { id: 825121, name: 'Luka Doncic', averages: { points: 33.9, rebounds: 9.2, assists: 9.8 } },
                { id: 341015, name: 'Nikola Jokic', averages: { points: 26.4, rebounds: 12.4, assists: 9.0 } },
                { id: 816960, name: 'Giannis Antetokounmpo', averages: { points: 30.2, rebounds: 11.5, assists: 6.5 } }
            ],
            'baseball': [
                { id: 832962, name: 'Shohei Ohtani', averages: { hits: 1.2, homeRuns: 0.4 } },
                { id: 792742, name: 'Aaron Judge', averages: { hits: 1.1, homeRuns: 0.5 } }
            ],
            'nhl': [
                { id: 792817, name: 'Connor McDavid', averages: { goals: 0.8, assists: 1.5 } },
                { id: 341018, name: 'Nathan MacKinnon', averages: { goals: 0.7, assists: 1.2 } }
            ],
            'tennis': [
                { id: 14882, name: 'Novak Djokovic', averages: { aces: 6.5 } },
                { id: 1042571, name: 'Carlos Alcaraz', averages: { aces: 5.2 } }
            ],
            'football': [
                { id: 825123, name: 'Erling Haaland', averages: { goals: 1.1, shotsOnTarget: 2.5 } },
                { id: 326778, name: 'Kylian Mbappé', averages: { goals: 0.9, shotsOnTarget: 2.2 } }
            ],
            'american-football': [
                { id: 792821, name: 'Patrick Mahomes', averages: { touchdowns: 2.4, passingYards: 285 } },
                { id: 1056801, name: 'Christian McCaffrey', averages: { touchdowns: 1.2, rushingYards: 95 } }
            ]
        };
        return mocks[sport] || mocks['basketball'];
    };

    const generatePrediction = async () => {
        if (!user) { toast.error('Debes iniciar sesión'); return; }
        const limitCheck = await checkPredictionLimit();
        if (!limitCheck.canPredict) { toast.error('Límite alcanzado. ¡Premium!'); return; }
        if (!selectedPlayer || !line) { setError('Falta selección'); return; }

        try {
            setIsThinking(true);
            setPrediction(null);
            setThinkingProgress(0);
            setError(null);

            // Efecto de escaneo
            const element = document.getElementById('predictor-container');
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const apiPromise = axios.post(`${API_URL}/api/sports/${currentSport}/predict`, {
                playerId: selectedPlayer.id,
                playerName: selectedPlayer.name,
                propType,
                line: parseFloat(line)
            }, { timeout: 30000 });

            let progress = 0;
            thinkingTimerRef.current = setInterval(() => {
                progress += 1;
                const percentage = Math.floor((progress / 300) * 100);
                setThinkingProgress(Math.min(99, percentage));
                const msgs = thinkingMessagesBySport[currentSport];
                setThinkingMessage(msgs[Math.min(Math.floor(progress / (300 / msgs.length)), msgs.length - 1)]);

                if (progress >= 300) {
                    clearInterval(thinkingTimerRef.current!);
                    apiPromise.then(async response => {
                        if (response.data.success) {
                            setThinkingProgress(100);
                            const data = response.data.data;
                            setPrediction(data);
                            await saveToHistory({ ...data.prediction, playerName: selectedPlayer.name, sport: currentSport, propType, line: parseFloat(line) });
                            await usePrediction();
                        }
                        setIsThinking(false);
                    }).catch(() => { setError('Error IA'); setIsThinking(false); });
                }
            }, 100);
        } catch (err: any) { setError(err.message); setIsThinking(false); }
    };

    const sparklineData = playerStats?.averages?.lastGames?.slice(0, 10).map((g: any, i: number) => ({
        value: currentSport === 'basketball' ? (g.points || 0) :
            currentSport === 'football' ? (g.shotsOnTarget || g.goals || 0) :
                currentSport === 'american-football' ? (g.passingYards || g.touchdowns || 0) :
                    currentSport === 'baseball' ? (g.hits || g.homeRuns || 0) : (g.goals || 0),
        index: i,
        date: g.date
    })).reverse() || [];

    const getHeatmapColor = (value: number, avg: number) => {
        if (value > avg * 1.1) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        if (value < avg * 0.9) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        return 'bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    };

    return (
        <div id="predictor-container" className="w-full space-y-8 relative">
            {/* AI HUD OVERLAY */}
            {isThinking && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="max-w-md w-full glass-card p-12 border-2 border-purple-500/50 rounded-[3rem] relative overflow-hidden text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent)] animate-pulse"></div>
                        <div className="w-32 h-32 mx-auto relative mb-8">
                            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-4 border-2 border-purple-500/10 rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain className="w-12 h-12 text-purple-500 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Iniciando Oráculo</h3>
                        <p className="text-purple-400 text-[10px] font-black uppercase tracking-[.3em] mb-8">{thinkingMessage}</p>

                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${thinkingProgress}%` }}></div>
                        </div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{thinkingProgress}% PROCESADO</div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="glass-card p-6 bg-gradient-to-br from-purple-900/40 to-black border border-white/10 rounded-[2rem] flex justify-between items-center group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all duration-700"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">{sports.find(s => s.id === currentSport)?.icon} {currentSport.toUpperCase()} <span className="text-purple-500">ANALIZADOR</span></h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">SISTEMA ELITE • AI 2.5</p>
                </div>
                {user && (
                    <div className="text-right relative z-10">
                        <div className="text-[9px] font-black text-gray-400 uppercase">Consultas</div>
                        <div className="text-xl font-black italic">{user.predictionsUsed} <span className="text-gray-600">/</span> <span className="text-purple-500">{user.predictionsLimit}</span></div>
                    </div>
                )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-3xl text-xs font-black uppercase tracking-widest">{error}</div>}

            {/* Sport Selector */}
            {!fixedSport && (
                <div className="flex bg-white/5 p-1.5 rounded-2xl gap-1">
                    {sports.map(s => (
                        <button key={s.id} onClick={() => { setCurrentSport(s.id as Sport); setSelectedPlayer(null); setPrediction(null); }} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${currentSport === s.id ? 'bg-white text-black font-black scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <span className="text-xl">{s.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Player Selection */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-2">Seleccionar Atleta</h3>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {topPlayers.map(p => (
                        <button key={p.id} onClick={() => setSelectedPlayer(p)} className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden group flex items-center gap-3 ${selectedPlayer?.id === p.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/2 hover:border-white/10'}`}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5 relative">
                                <img
                                    src={`${API_URL}/api/proxy/player-image/${p.id}`}
                                    className="w-full h-full object-cover"
                                    alt={p.name}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.sofascore.com/static/images/placeholders/player.png'; }}
                                />
                                {selectedPlayer?.id === p.id && <div className="absolute inset-0 bg-purple-500/20"></div>}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className={`font-black uppercase text-[10px] truncate ${selectedPlayer?.id === p.id ? 'text-white' : 'text-gray-400'}`}>{p.name}</div>
                                {p.averages && (
                                    <div className="flex gap-2 mt-0.5">
                                        <div className="text-[7px] font-black text-purple-400 uppercase">
                                            {currentSport === 'basketball' ? `PTS: ${p.averages.points}` :
                                                currentSport === 'football' ? `SOT: ${p.averages.shotsOnTarget}` :
                                                    currentSport === 'american-football' ? `TD: ${p.averages.touchdowns}` :
                                                        currentSport === 'baseball' ? `H: ${p.averages.hits}` : ''}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {selectedPlayer?.id === p.id && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* UPGRADED TREND CHART SECTION */}
            {selectedPlayer && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="glass-card p-6 border border-white/5 bg-white/[0.02] rounded-[2.5rem] space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20">
                                    <div className="w-full h-full rounded-[0.85rem] bg-black overflow-hidden">
                                        <img
                                            src={`${API_URL}/api/proxy/player-image/${selectedPlayer.id}`}
                                            className="w-full h-full object-cover scale-110"
                                            alt={selectedPlayer.name}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[150px]">{selectedPlayer.name}</h4>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-purple-500" />
                                        <span className="text-[8px] font-black text-gray-500 uppercase">Power Tendencia</span>
                                    </div>
                                </div>
                            </div>
                            {loadingStats && <Activity className="w-3 h-3 text-purple-500 animate-spin" />}
                        </div>

                        {playerStats ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="h-24 w-full relative group">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent rounded-b-2xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData}>
                                            <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 2 }} activeDot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-0 right-0 text-[8px] font-black text-gray-600 uppercase">Tendencia de Volumen</div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4 border-l border-white/5 pl-8">
                                        {Object.entries(playerStats.averages?.averages || {}).slice(0, 3).map(([k, v]: any) => {
                                            const labelMap: Record<string, string> = {
                                                'points': 'Puntos',
                                                'assists': 'Asistencias',
                                                'rebounds': 'Rebotes',
                                                'goals': 'Goles',
                                                'shotsOnTarget': 'Remates Puerta',
                                                'hits': 'Hits',
                                                'homeRuns': 'Home Runs',
                                                'touchdowns': 'Touchdowns',
                                                'passingYards': 'Yardas Aire',
                                                'rushingYards': 'Yardas Tierra',
                                                'strikeouts': 'Ponches (K)'
                                            };
                                            return (
                                                <div key={k} className="relative group/stat">
                                                    <div className="absolute -inset-2 bg-purple-500/5 blur-xl opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                                                    <div className="relative">
                                                        <div className="text-[8px] font-black text-gray-500 uppercase mb-1 tracking-widest">{labelMap[k] || k}</div>
                                                        <div className="text-2xl font-black text-white italic tracking-tighter bg-clip-text bg-gradient-to-b from-white to-gray-400">
                                                            {v}
                                                            {currentSport === 'basketball' && k === 'points' && v > 25 && <span className="ml-1 text-[10px] text-orange-500 animate-pulse">🔥</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* HEATMAP STRIP */}
                                    <div className="pl-8 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Estabilidad (Last 10)</span>
                                            <span className="text-[8px] font-black text-purple-500 uppercase">Elite Tracking</span>
                                        </div>
                                        <div className="flex gap-1.5 h-3">
                                            {sparklineData.map((d: any, idx: number) => {
                                                const mainStat = Object.entries(playerStats.averages?.averages || {})[0];
                                                const avg = parseFloat(String(mainStat[1]));
                                                return (
                                                    <div key={idx} className={`flex-1 rounded-sm ${getHeatmapColor(d.value, avg)} opacity-60 hover:opacity-100 transition-all cursor-crosshair relative group/tooltip`}>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[8px] font-black rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap z-50 transition-opacity">
                                                            VAL: {d.value}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !loadingStats && <div className="h-24 flex items-center justify-center"><Activity className="w-6 h-6 text-purple-500/20 animate-pulse" /></div>}
                    </div>
                </div>
            )}

            {/* CONFIGURATION & ACTION */}
            {selectedPlayer && (
                <div className="glass-card p-6 border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2.5rem] space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        {propTypesBySport[currentSport].map(type => (
                            <button key={type.value} onClick={() => setPropType(type.value)} className={`py-3 px-4 rounded-2xl border transition-all flex items-center gap-3 ${propType === type.value ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>
                                <span className="text-lg">{type.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <input type="number" step="0.5" value={line} onChange={(e) => setLine(e.target.value)} placeholder="Línea de la Casa" className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-4xl font-black text-white focus:border-purple-500 transition-all outline-none" />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-purple-500 text-black font-black text-[10px] px-3 py-1 rounded-full uppercase italic">{propType}</div>
                    </div>
                    <button onClick={generatePrediction} disabled={isThinking || !line} className={`w-full py-6 rounded-[2rem] font-black uppercase italic tracking-widest text-lg transition-all ${isThinking || !line ? 'bg-neutral-800 text-neutral-600' : 'bg-white text-black hover:scale-[1.02] shadow-2xl'}`}>
                        {isThinking ? 'Analizando...' : 'Lanzar Análisis IA ☄️'}
                    </button>
                </div>
            )}

            {/* PREDICTION RESULT (Simplified for Elite UI) */}
            {prediction && (
                <div className="glass-card rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-black overflow-hidden animate-in zoom-in-95 duration-700">
                    <div className={`h-2 ${['OVER', 'HOME', 'YES'].includes(prediction.prediction.prediction) ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div className="p-8 text-center">
                        <div className={`text-6xl font-black italic tracking-tighter mb-2 ${['OVER', 'HOME', 'YES'].includes(prediction.prediction.prediction) ? 'text-emerald-500' : 'text-red-500'}`}>{prediction.prediction.prediction}</div>
                        <div className="text-xl font-black text-white">{prediction.line} <span className="text-gray-500 uppercase opacity-60 italic">{prediction.propType}</span></div>
                        <div className="mt-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 text-xs text-gray-300 italic">"{prediction.prediction.reasoning}"</div>
                        <div className="mt-4 flex justify-center gap-4">
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">{prediction.prediction.probability}% Certeza</div>
                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">{prediction.prediction.confidence} Confianza</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerPropsPredictor;
