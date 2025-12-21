'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BasketballPredictionProps {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    isPremium?: boolean;
}

export default function BasketballPredictionPremium({ eventId, homeTeam, awayTeam, isPremium = false }: BasketballPredictionProps) {
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: eventId, sport: 'basketball' })
            });
            const data = await res.json();
            setPrediction(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-900/40 to-purple-900/40 rounded-2xl p-6 border border-orange-500/30">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span className="text-3xl">🏀</span> Predicción NBA
                </h3>
                {!prediction && (
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="px-6 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Analizando...' : 'Generar Predicción'}
                    </button>
                )}
            </div>

            {prediction && (
                <div className="space-y-6">
                    {/* Winner Badge */}
                    <div className="relative bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-center shadow-2xl">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3">
                            <span className="text-4xl">🏆</span>
                        </div>
                        <p className="text-white/80 text-xs uppercase font-bold mb-2 mt-2">Ganador Predicho</p>
                        <p className="text-3xl font-black text-white">{prediction.winner}</p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <div className="flex-1 max-w-xs h-3 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full"
                                    style={{ width: `${prediction.confidence}%` }}
                                ></div>
                            </div>
                            <span className="text-white font-black text-xl">{prediction.confidence}%</span>
                        </div>
                    </div>

                    {/* FREE: Basic Analysis */}
                    <div className="bg-black/30 p-4 rounded-lg">
                        <p className="text-orange-300 text-xs uppercase font-bold mb-2">Análisis de IA</p>
                        <p className="text-gray-200 text-sm leading-relaxed">{prediction.reasoning}</p>
                    </div>

                    {/* PREMIUM CONTENT */}
                    <div className="relative">
                        {!isPremium && (
                            <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/70 rounded-lg flex flex-col items-center justify-center p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-3 shadow-2xl animate-pulse">
                                    <span className="text-3xl">👑</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Contenido Premium</h3>
                                <p className="text-gray-400 mb-4 text-center max-w-sm text-sm">
                                    Desbloquea jugadores top, props, handicap y totales
                                </p>
                                <a
                                    href="/pricing"
                                    className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-lg"
                                >
                                    Ser Premium ($5)
                                </a>
                            </div>
                        )}

                        <div className={!isPremium ? 'opacity-20 blur-sm pointer-events-none' : ''}>
                            {/* Top Players with Photos */}
                            {prediction.predictions?.topPlayers && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Home Top Scorer */}
                                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-4 border border-blue-500/30">
                                        <p className="text-blue-300 text-xs uppercase font-bold mb-3">🏠 Top Scorer Local</p>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400">
                                                <Image
                                                    src={`/api/proxy/player-image/${prediction.predictions.topPlayers.homeTopScorer.playerId || 12345}`}
                                                    alt={prediction.predictions.topPlayers.homeTopScorer.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/player-placeholder.png';
                                                    }}
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.homeTopScorer.name}</p>
                                                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-gray-400">PTS</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.homeTopScorer.predictedPoints}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">REB</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.homeTopScorer.predictedRebounds}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">AST</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.homeTopScorer.predictedAssists}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Away Top Scorer */}
                                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl p-4 border border-red-500/30">
                                        <p className="text-red-300 text-xs uppercase font-bold mb-3">✈️ Top Scorer Visitante</p>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-400">
                                                <Image
                                                    src={`/api/proxy/player-image/${prediction.predictions.topPlayers.awayTopScorer.playerId || 12346}`}
                                                    alt={prediction.predictions.topPlayers.awayTopScorer.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/player-placeholder.png';
                                                    }}
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.awayTopScorer.name}</p>
                                                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-gray-400">PTS</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.awayTopScorer.predictedPoints}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">REB</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.awayTopScorer.predictedRebounds}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">AST</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.topPlayers.awayTopScorer.predictedAssists}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Betting Markets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Handicap */}
                                {prediction.predictions?.spread && (
                                    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                                        <p className="text-purple-300 text-xs uppercase font-bold mb-2">📊 Handicap</p>
                                        <p className="text-white font-bold text-2xl">{prediction.predictions.spread.favorite} {prediction.predictions.spread.line}</p>
                                        <p className="text-gray-400 text-sm mt-1">{prediction.predictions.spread.recommendation}</p>
                                    </div>
                                )}

                                {/* Over/Under */}
                                {prediction.predictions?.overUnder && (
                                    <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                                        <p className="text-green-300 text-xs uppercase font-bold mb-2">🎯 Totales</p>
                                        <p className="text-white font-bold text-2xl">{prediction.predictions.overUnder.pick} {prediction.predictions.overUnder.line}</p>
                                        <p className="text-gray-400 text-sm mt-1">Confianza: {prediction.predictions.overUnder.confidence}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
