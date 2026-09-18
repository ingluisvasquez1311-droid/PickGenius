"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart2 } from "lucide-react";

interface Prediction {
  prediction: string;
  risk_level: string;
  confidence: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];

export default function StatsChart({ predictions }: { predictions: Prediction[] }) {
  const sportCounts = predictions.reduce<Record<string, number>>((acc, p) => {
    const key = p.prediction === "home_win" ? "Local" :
                p.prediction === "away_win" ? "Visitante" : "Empate";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(sportCounts).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <BarChart2 size={14} className="text-brand-500" />
        Distribución de predicciones
      </h3>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0d1520",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0"
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {entry.name} ({entry.value})
          </div>
        ))}
      </div>
    </div>
  );
}
