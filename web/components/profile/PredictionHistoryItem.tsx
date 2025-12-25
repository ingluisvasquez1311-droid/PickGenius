'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Zap, Target } from 'lucide-react';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { type PredictionRecord } from '@/lib/userService';

interface PredictionHistoryItemProps {
    record: PredictionRecord;
}

export default function PredictionHistoryItem({ record }: PredictionHistoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const isMatchPrediction = !!record.gameId;

    useEffect(() => {
        async function fetchResult() {
            if (isMatchPrediction && record.gameId && isExpanded && !matchResult) {
                setLoading(true);
                try {
                    const data = await sportsDataService.getEventsBySport(record.sport || 'football');
                    const match = data.find((m: any) => m.id.toString() === record.gameId);
                    if (match) {
                        setMatchResult(match);
                    }
                } catch (error) {
                    console.error('Error fetching match result:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchResult();
    }, [isExpanded, record.gameId, record.sport, isMatchPrediction, matchResult]);

    // Check if AI was right (Simple version for MVP)
    const getWinnerStatus = () => {
        // Priorizar el estado guardado en Firestore
        if (record.status && record.status !== 'pending') return record.status;

        if (!matchResult || matchResult.status?.type !== 'finished') return 'pending';

        const homeScore = matchResult.homeScore?.current || 0;
        const awayScore = matchResult.awayScore?.current || 0;

        let actualWinner = 'Draw';
        if (homeScore > awayScore) actualWinner = matchResult.homeTeam?.name;
        if (awayScore > homeScore) actualWinner = matchResult.awayTeam?.name;

        if (record.winner && record.winner.includes(actualWinner)) return 'won';
        if (record.winner && record.winner.toLowerCase().includes('gana') && actualWinner !== 'Draw') {
            if (record.winner.toLowerCase().includes(matchResult.homeTeam?.name.toLowerCase()) && homeScore > awayScore) return 'won';
            if (record.winner.toLowerCase().includes(matchResult.awayTeam?.name.toLowerCase()) && awayScore > homeScore) return 'won';
        }

        return 'lost';
    };

    const status = getWinnerStatus();

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all hover:bg-white/[0.04]">
            <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => isMatchPrediction && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                        {record.sport === 'football' ? '⚽' : '🏀'}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-sm font-black uppercase tracking-tight text-white">
                                {isMatchPrediction ? `${record.homeTeam || 'Local'} vs ${record.awayTeam || 'Visitante'}` : record.playerName}
                            </h4>
                            {status === 'won' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            {status === 'lost' && <XCircle className="w-4 h-4 text-red-500" />}
                            {status === 'pending' && <Clock className="w-4 h-4 text-gray-500" />}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {isMatchPrediction ? record.bettingTip : `${record.prediction} ${record.line}`} • {new Date(record.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xl font-black italic tracking-tighter text-purple-500">{record.probability || record.confidence}%</p>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Confianza</p>
                    </div>
                    {isMatchPrediction && (
                        <div className="text-gray-500">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && isMatchPrediction && (
                <div className="p-6 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-1 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* AI Vision Re-cap */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Zap className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Visión del Genio</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                "{record.reasoning}"
                            </p>

                            {record.keyFactors && (
                                <div className="space-y-1">
                                    {record.keyFactors.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                                            <span className="text-purple-500">✦</span> {f}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Player Prop Details or Detailed match targets */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Target className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isMatchPrediction ? 'Objetivos vs Realidad' : 'Análisis del Prop'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {!isMatchPrediction && (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 uppercase font-bold text-[9px]">Categoría</span>
                                            <span className="text-white font-black">{record.propType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 uppercase font-bold text-[9px]">Línea Proyectada</span>
                                            <span className="text-white font-black">{record.line || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 uppercase font-bold text-[9px]">Predicción</span>
                                            <span className="text-purple-400 font-black uppercase">{record.prediction}</span>
                                        </div>
                                    </div>
                                )}
                                {record.predictions && (
                                    <>
                                        {/* Goals/Score */}
                                        <div className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-gray-400 uppercase font-bold text-[9px]">Goles/Marcador</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-white font-black">{record.predictions.finalScore || record.predictions.totalGoals}</span>
                                                {matchResult && (
                                                    <span className="text-purple-400 font-mono">
                                                        [{matchResult.homeScore?.current}-{matchResult.awayScore?.current}]
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Corners */}
                                        {record.predictions.corners && (
                                            <div className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                                                <span className="text-gray-400 uppercase font-bold text-[9px]">Córners</span>
                                                <span className="text-white font-black">{record.predictions.corners.total}</span>
                                            </div>
                                        )}

                                        {/* Offsides */}
                                        {record.predictions.offsides && (
                                            <div className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                                                <span className="text-gray-400 uppercase font-bold text-[9px]">Fueras de Juego</span>
                                                <span className="text-white font-black">{record.predictions.offsides.total}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {loading && (
                                <div className="text-[9px] text-purple-400 animate-pulse text-center">Consultando terminales de Sofascore...</div>
                            )}

                            {!loading && matchResult?.status?.type === 'finished' && (
                                <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                    <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">¡Análisis Comparativo Finalizado!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
