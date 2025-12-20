// web/components/basketball/PlayerPropsPredictor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerPropsPredictor = () => {
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [propType, setPropType] = useState('points');
    const [line, setLine] = useState('');
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determinar la URL base de la API (ajustar según tu configuración)
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const propTypes = [
        { value: 'points', label: 'Puntos', icon: '🏀' },
        { value: 'assists', label: 'Asistencias', icon: '🤝' },
        { value: 'rebounds', label: 'Rebotes', icon: '💪' },
        { value: 'steals', label: 'Robos', icon: '🔒' },
        { value: 'blocks', label: 'Bloqueos', icon: '🛡️' }
    ];

    useEffect(() => {
        loadTopPlayers();
    }, []);

    const loadTopPlayers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/nba/players/top`);
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
            setLoading(true);
            setError(null);

            const response = await axios.post(`${API_BASE}/api/nba/players/predict`, {
                playerId: selectedPlayer.id,
                playerName: selectedPlayer.name,
                propType,
                line: parseFloat(line)
            });

            if (response.data.success) {
                setPrediction(response.data.data);
            }
        } catch (err: any) {
            setError('Error generando predicción: ' + (err.response?.data?.error || err.message));
            setPrediction(null);
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (conf: string) => {
        if (conf === 'Alta') return 'text-green-400';
        if (conf === 'Media') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="w-full space-y-6">
            <div className="glass-card p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[rgba(255,255,255,0.1)]">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>🏀</span> NBA Player Props Predictor
                </h2>
                <p className="text-[var(--text-muted)] text-sm">
                    Análisis inteligente con IA basado en estadísticas reales de Sofascore
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Selector de Jugadores */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    ⭐ Jugadores Destacados
                </h3>

                {loading && !topPlayers.length ? (
                    <div className="flex flex-col items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
                        <p className="mt-4 text-[var(--text-muted)]">Cargando estrellas de la NBA...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {topPlayers.map((player) => (
                            <div
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedPlayer?.id === player.id
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                        : 'border-[rgba(255,255,255,0.05)] hover:border-[var(--primary)]/30 bg-[rgba(255,255,255,0.02)]'
                                    }`}
                            >
                                <div className="font-bold text-white text-sm truncate">{player.name}</div>
                                {player.averages && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                                            <span>PTS: <span className="text-white">{player.averages.points}</span></span>
                                            <span>AST: <span className="text-white">{player.averages.assists}</span></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Formulario de Predicción */}
            {selectedPlayer && (
                <div className="glass-card p-6 border-t-4 border-[var(--primary)]">
                    <h3 className="text-xl font-bold text-white mb-6">
                        Predicción para <span className="text-[var(--primary)]">{selectedPlayer.name}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tipo de Prop */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Estadística</label>
                            <div className="grid grid-cols-2 gap-2">
                                {propTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setPropType(type.value)}
                                        className={`py-2 px-3 rounded-lg border text-xs transition-all flex flex-col items-center gap-1 ${propType === type.value
                                                ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white'
                                                : 'border-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:border-[var(--primary)]/40'
                                            }`}
                                    >
                                        <span className="text-lg">{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Línea */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Línea de la Casa</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={line}
                                    onChange={(e) => setLine(e.target.value)}
                                    placeholder="Ej: 24.5"
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 text-white text-2xl font-bold focus:border-[var(--primary)] focus:outline-none placeholder:text-[rgba(255,255,255,0.1)]"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)] font-bold">
                                    {propType.toUpperCase()}
                                </div>
                            </div>
                            {selectedPlayer.averages && (
                                <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-muted)]">Promedio últimos 5:</span>
                                    <span className="text-[var(--primary)] font-bold">{selectedPlayer.averages[propType]}</span>
                                </div>
                            )}
                        </div>

                        {/* Botón */}
                        <div className="flex items-end">
                            <button
                                onClick={generatePrediction}
                                disabled={loading || !line}
                                className={`w-full py-4 rounded-xl font-bold text-black transition-all shadow-lg ${loading || !line
                                        ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? '🤖 Analizando con IA...' : '🎯 Obtener Predicción'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultado de Predicción */}
            {prediction && (
                <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-1 ${prediction.prediction.prediction === 'OVER' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Card de Decisión */}
                            <div className="md:w-1/3 flex flex-col items-center justify-center p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-center">
                                <div className="text-6xl mb-4">
                                    {prediction.prediction.prediction === 'OVER' ? '📈' : '📉'}
                                </div>
                                <div className={`text-5xl font-black mb-2 ${prediction.prediction.prediction === 'OVER' ? 'text-green-500' : 'text-red-500'}`}>
                                    {prediction.prediction.prediction}
                                </div>
                                <div className="text-white/60 text-sm uppercase tracking-widest font-bold">
                                    {prediction.player}
                                </div>
                                <div className="text-[var(--primary)] text-xl mt-1">
                                    {prediction.line} {prediction.propType}
                                </div>

                                <div className="mt-8 w-full space-y-4">
                                    <div className="bg-white/5 rounded-xl p-3">
                                        <div className="text-[10px] text-white/40 uppercase">Probabilidad</div>
                                        <div className="text-2xl font-bold text-white">{prediction.prediction.probability}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3">
                                        <div className="text-[10px] text-white/40 uppercase">Confianza</div>
                                        <div className={`text-xl font-bold ${getConfidenceColor(prediction.prediction.confidence)}`}>
                                            {prediction.prediction.confidence}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Análisis Detallado */}
                            <div className="md:w-2/3 space-y-6">
                                <div>
                                    <h4 className="text-[var(--primary)] font-bold uppercase text-xs tracking-wider mb-3">Razonamiento de la IA</h4>
                                    <p className="text-white/80 leading-relaxed text-sm">
                                        {prediction.prediction.reasoning}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-[var(--primary)] font-bold uppercase text-xs tracking-wider mb-3">Factores de Impacto</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {prediction.prediction.keyFactors?.map((factor: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                                                <span className="text-white/80 text-sm">{factor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 grid grid-cols-4 gap-2">
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-[10px] text-white/40">PTS</div>
                                        <div className="font-bold text-white">{prediction.averages.points}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-[10px] text-white/40">AST</div>
                                        <div className="font-bold text-white">{prediction.averages.assists}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-[10px] text-white/40">REB</div>
                                        <div className="font-bold text-white">{prediction.averages.rebounds}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-[10px] text-white/40">MIN</div>
                                        <div className="font-bold text-white">{prediction.averages.minutes}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Game Log */}
                        <div className="mt-10">
                            <h4 className="text-[var(--primary)] font-bold uppercase text-xs tracking-wider mb-4 px-1">Historial Reciente (SofaScore)</h4>
                            <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="p-4 text-left font-medium text-white/60">Fecha</th>
                                            <th className="p-4 text-left font-medium text-white/60">Rival</th>
                                            <th className="p-4 text-center font-medium text-white/60">PTS</th>
                                            <th className="p-4 text-center font-medium text-white/60">AST</th>
                                            <th className="p-4 text-center font-medium text-white/60">REB</th>
                                            <th className="p-4 text-center font-medium text-white/60">MIN</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {prediction.lastGames?.map((game: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-white/80">{new Date(game.date).toLocaleDateString('es-ES')}</td>
                                                <td className="p-4 text-white font-medium">{game.opponent}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-block px-2 py-1 rounded ${game.points >= parseFloat(line) && propType === 'points' ? 'bg-green-500/20 text-green-400 font-bold' : 'text-white/80'}`}>
                                                        {game.points}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-white/80">{game.assists}</td>
                                                <td className="p-4 text-center text-white/80">{game.rebounds}</td>
                                                <td className="p-4 text-center text-white/80">{game.minutes}</td>
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
