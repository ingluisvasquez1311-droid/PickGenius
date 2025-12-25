'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/stats/StatCard';
import BetHistoryTable from '@/components/stats/BetHistoryTable';
import { checkPendingPredictions } from '@/lib/services/resultService';
import { getUserPredictions } from '@/lib/userService';
import { Trophy, TrendingUp, Target, RotateCcw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyStatsPage() {
    const { user } = useAuth();
    const [verifying, setVerifying] = useState(false);
    const [verificationCount, setVerificationCount] = useState(0);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // 1. Verificar predicciones pendientes al cargar
    useEffect(() => {
        const verify = async () => {
            if (user?.uid) {
                setVerifying(true);
                try {
                    const count = await checkPendingPredictions(user.uid);
                    setVerificationCount(count);
                } catch (error) {
                    console.error("Error verifying predictions:", error);
                } finally {
                    setVerifying(false);
                    // Recargar historial después de verificar
                    loadHistory();
                }
            } else {
                setLoadingHistory(false);
            }
        };

        verify();
    }, [user?.uid]);

    // 2. Cargar historial
    const loadHistory = async () => {
        if (!user?.uid) return;
        setLoadingHistory(true);
        try {
            const preds = await getUserPredictions(user.uid, 50); // Últimas 50
            setPredictions(preds);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Calcular métricas
    const stats = (user?.stats || {}) as any;
    const wins = stats.wins || 0;
    const losses = stats.losses || 0;
    const pushes = stats.pushes || 0;
    const totalFinished = wins + losses + pushes;

    const winRate = totalFinished > 0
        ? ((wins / totalFinished) * 100).toFixed(1)
        : "0.0";

    const netProfitDisplay = (wins * 1) - (losses * 1); // Simplificado (Units)

    return (
        <div className="min-h-screen bg-[#050505]">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
                            Mi Rendimiento
                        </h1>
                        <p className="text-gray-400 text-sm font-medium">
                            Estadísticas en tiempo real de tus predicciones
                        </p>
                    </div>

                    {verifying && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
                            <Activity className="w-3 h-3 animate-spin" />
                            Verificando resultados...
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard
                        title="Win Rate"
                        value={`${winRate}%`}
                        icon={Target}
                        color="emerald"
                        trend="vs last week"
                        trendUp={true}
                    />
                    <StatCard
                        title="Profit (Units)"
                        value={`${netProfitDisplay > 0 ? '+' : ''}${netProfitDisplay}u`}
                        icon={TrendingUp}
                        color={netProfitDisplay >= 0 ? "blue" : "red"}
                    />
                    <StatCard
                        title="Wins"
                        value={wins}
                        icon={Trophy}
                        color="yellow"
                    />
                    <StatCard
                        title="Total Bets"
                        value={totalFinished}
                        icon={RotateCcw}
                        color="purple"
                    />
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-red-600 rounded-full" />
                            Historial Reciente
                        </h2>

                        {verificationCount > 0 && !verifying && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-bold text-emerald-400"
                            >
                                ✨ {verificationCount} nuevos resultados verificados
                            </motion.span>
                        )}
                    </div>

                    <BetHistoryTable
                        predictions={predictions}
                        loading={loadingHistory}
                    />
                </div>
            </div>
        </div>
    );
}
