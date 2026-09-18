"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Clock, Zap } from "lucide-react";
import PredictionCard from "@/components/PredictionCard";
import LiveMatchesList from "@/components/LiveMatchesList";
import StatsChart from "@/components/StatsChart";
import DashboardNav from "@/components/DashboardNav";
import { usePredictions } from "@/hooks/usePredictions";
import { useLiveMatches } from "@/hooks/useLiveMatches";

export default function DashboardPage() {
  const { user } = useUser();
  const { predictions, loading: loadingPred } = usePredictions();
  const { matches, loading: loadingMatches } = useLiveMatches();

  const statsCards = [
    {
      icon: Activity,
      label: "Partidos en vivo",
      value: matches.length,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      icon: Zap,
      label: "Predicciones hoy",
      value: predictions.length,
      color: "text-brand-400",
      bg: "bg-brand-400/10",
    },
    {
      icon: TrendingUp,
      label: "Alta confianza (>70%)",
      value: predictions.filter(p => (p.confidence ?? 0) >= 0.7).length,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Clock,
      label: "Próximas 24h",
      value: predictions.length,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saludo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white">
            Bienvenido, {user?.firstName || "Genio"} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Aquí tienes el resumen de hoy en tiempo real.
          </p>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className={`${card.bg} ${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <card.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-white">
                {loadingPred || loadingMatches ? "–" : card.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Predicciones - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap size={18} className="text-brand-500" />
              Predicciones IA
            </h2>
            {loadingPred ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="glass-card rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-gray-500">
                <Zap size={32} className="mx-auto mb-3 opacity-30" />
                <p>El oráculo está procesando predicciones...</p>
                <p className="text-xs mt-1">Vuelve en unos minutos</p>
              </div>
            ) : (
              predictions.slice(0, 8).map((pred, i) => (
                <PredictionCard key={pred.match_id || i} prediction={pred} index={i} />
              ))
            )}
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6">
            <LiveMatchesList matches={matches} loading={loadingMatches} />
            <StatsChart predictions={predictions} />
          </div>
        </div>
      </main>
    </div>
  );
}
