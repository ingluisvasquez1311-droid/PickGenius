'use client';

import React, { useState } from 'react';

import { API_URL } from '@/lib/api';

interface AIPredictionCardProps {
    eventId: string;
    sport: string;
}

export default function AIPredictionCard({ eventId, sport }: AIPredictionCardProps) {
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/sofascore/predict/${sport}/${eventId}`);
            const data = await response.json();

            if (data.success) {
                // Parsear la respuesta JSON que viene dentro del texto de Gemini
                try {
                    // Limpiar bloques de código markdown si existen
                    const cleanJson = data.prediction.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedPrediction = JSON.parse(cleanJson);
                    setPrediction(parsedPrediction);
                } catch (e) {
                    // Si no es JSON válido, mostrar el texto crudo
                    setPrediction({ reasoning: data.prediction });
                }
            } else {
                setError(data.error || 'Error al generar predicción');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border border-purple-500/30 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">✨</span> PickGenius AI
                    </h2>
                    {!prediction && (
                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="px-6 py-2 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-purple-900 border-t-transparent rounded-full"></div>
                                    Analizando...
                                </>
                            ) : (
                                'Generar Predicción'
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {prediction && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-purple-300 text-xs uppercase font-bold mb-1">Ganador Probable</p>
                                <p className="text-xl font-bold text-white">{prediction.winner || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-purple-300 text-xs uppercase font-bold mb-1">Confianza</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-400 rounded-full"
                                            style={{ width: prediction.confidence?.replace('%', '') + '%' || '0%' }}
                                        ></div>
                                    </div>
                                    <span className="text-white font-bold">{prediction.confidence || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-purple-300 text-xs uppercase font-bold mb-2">Análisis de IA</p>
                            <p className="text-gray-200 leading-relaxed text-sm">
                                {prediction.reasoning}
                            </p>
                        </div>

                        {/* DETAILED STATS GRID */}
                        {prediction.details && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-500/20">
                                    <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">
                                        {sport === 'football' ? 'Goles' : 'Puntos'}
                                    </p>
                                    <p className="text-white font-semibold text-sm">{prediction.details.goals_points || '-'}</p>
                                </div>
                                <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-500/20">
                                    <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">
                                        {sport === 'football' ? 'Corners' : 'Rebotes'}
                                    </p>
                                    <p className="text-white font-semibold text-sm">{prediction.details.corners_rebounds || '-'}</p>
                                </div>
                                <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-500/20">
                                    <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">
                                        {sport === 'football' ? 'Tarjetas' : 'Faltas'}
                                    </p>
                                    <p className="text-white font-semibold text-sm">{prediction.details.cards_fouls || '-'}</p>
                                </div>
                                <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-500/20">
                                    <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">
                                        {sport === 'football' ? 'Tiros al Arco' : 'Efectividad'}
                                    </p>
                                    <p className="text-white font-semibold text-sm">{prediction.details.shots_accuracy || '-'}</p>
                                </div>
                            </div>
                        )}

                        {prediction.bettingTip && (
                            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg flex items-start gap-3">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <p className="text-green-300 text-xs uppercase font-bold mb-1">Recomendación de Apuesta</p>
                                    <p className="text-white font-bold">{prediction.bettingTip}</p>
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <button
                                onClick={handlePredict}
                                className="text-xs text-purple-300 hover:text-white underline"
                            >
                                Actualizar Análisis
                            </button>
                        </div>
                    </div>
                )}

                {!prediction && !loading && !error && (
                    <p className="text-purple-200 text-sm opacity-80">
                        Haz clic para que Gemini analice las estadísticas en tiempo real y prediga el resultado.
                    </p>
                )}
            </div>
        </div>
    );
}
