'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const trialDaysLeft = 14; // Mock logic

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/predictions/history?userId=${user?.uid}`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] pt-24 text-white text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Panel de Control</h1>
                        <p className="text-gray-400">Bienvenido de nuevo, {user?.email || 'Apostador'}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Subscription Status */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-[#111] border border-white/10 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-4 -mt-4"></div>

                            <h2 className="text-lg font-bold mb-4 text-gray-200">Tu Suscripción</h2>

                            {user?.isPremium ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(250,204,21,0.3)] animate-pulse-slow">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <p className="text-xl font-bold text-white mb-1">Premium Activo</p>
                                    <p className="text-sm text-yellow-500 font-bold mb-4">Prueba Gratuita</p>
                                    <p className="text-xs text-gray-400 mb-6">Caduca en {trialDaysLeft} días</p>

                                    <button className="text-xs text-red-400 hover:text-red-300 underline">
                                        Cancelar Suscripción
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 mb-4">Estás usando el plan gratuito.</p>
                                    <Link
                                        href="/pricing"
                                        className="block w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
                                    >
                                        Pasar a Premium
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats & History */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Recent Activity */}
                        <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-200">Historial de Predicciones</h3>

                            {isLoadingHistory ? (
                                <p className="text-gray-500 text-sm">Cargando historial...</p>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No tienes predicciones guardadas aún.</p>
                                    <Link href="/basketball-live" className="text-purple-400 text-sm hover:underline mt-2 inline-block">
                                        ¡Haz tu primera predicción!
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {history.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">
                                                    {item.prediction.sport === 'football' ? '⚽' : '🏀'}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-white">
                                                        {item.prediction.match || `Partido #${item.gameId}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Pick: <span className="text-gray-300">{item.prediction.pick || item.prediction.winner}</span>
                                                    </p>
                                                    <p className="text-[10px] text-gray-600">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                                    Pendiente
                                                </span>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    Confianza: {item.prediction.confidence || '?'}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
