"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Prediction {
  match_id: string;
  prediction: "home_win" | "away_win" | "draw";
  confidence: number;
  probabilities: { home_win: number; draw: number; away_win: number };
  recommended_bet: { market: string; pick: string; value_rating: number; odds: number };
  analysis: string;
  key_factors: string[];
  risk_level: "low" | "medium" | "high";
  match: { home: string; away: string; league: string; sport: string; date: string };
  generated_at: string;
}

const RISK_CONFIG = {
  low:    { label: "Riesgo bajo",   color: "text-green-400",  bg: "bg-green-400/10",  Icon: Shield },
  medium: { label: "Riesgo medio",  color: "text-yellow-400", bg: "bg-yellow-400/10", Icon: AlertTriangle },
  high:   { label: "Riesgo alto",   color: "text-red-400",    bg: "bg-red-400/10",    Icon: AlertTriangle },
};

const PRED_LABEL = {
  home_win: "Gana Local",
  away_win: "Gana Visitante",
  draw:     "Empate",
};

export default function PredictionCard({ prediction: p, index }: { prediction: Prediction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const risk = RISK_CONFIG[p.risk_level] ?? RISK_CONFIG.medium;
  const RiskIcon = risk.Icon;
  const confidencePct = Math.round((p.confidence ?? 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-xl overflow-hidden cursor-pointer hover:border-brand-500/30 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">{p.match?.league} · {p.match?.sport}</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="truncate">{p.match?.home}</span>
              <span className="text-gray-600 flex-shrink-0">vs</span>
              <span className="truncate">{p.match?.away}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${risk.bg} ${risk.color}`}>
              <RiskIcon size={10} className="inline mr-1" />
              {risk.label}
            </span>
            <ChevronRight size={14} className={`text-gray-600 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Prediction badge + confidence bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="bg-brand-500/20 text-brand-300 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/30">
            {PRED_LABEL[p.prediction] ?? p.prediction}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ delay: index * 0.06 + 0.2, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-brand-400 w-10 text-right">{confidencePct}%</span>
          </div>
        </div>

        {/* Cuota recomendada */}
        {p.recommended_bet && (
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <TrendingUp size={12} className="text-brand-500" />
            <span>{p.recommended_bet.pick}</span>
            <span className="ml-auto font-mono text-brand-400 font-bold">
              @{p.recommended_bet.odds}
            </span>
            {"★".repeat(p.recommended_bet.value_rating ?? 0).padEnd(5, "☆")}
          </div>
        )}
      </div>

      {/* Expanded analysis */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/5 px-4 pb-4 pt-3"
        >
          <p className="text-xs text-gray-400 leading-relaxed mb-3">{p.analysis}</p>
          {p.key_factors?.length > 0 && (
            <div className="space-y-1">
              {p.key_factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-brand-500 mt-0.5">•</span>
                  {factor}
                </div>
              ))}
            </div>
          )}
          {/* Probabilidades */}
          {p.probabilities && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { key: "home_win", label: p.match?.home?.split(" ")[0] ?? "Local" },
                { key: "draw",     label: "Empate" },
                { key: "away_win", label: p.match?.away?.split(" ")[0] ?? "Visitante" },
              ].map(({ key, label }) => (
                <div key={key} className="bg-white/3 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500 truncate">{label}</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {p.probabilities[key as keyof typeof p.probabilities]}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
