"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface Match {
  id: string;
  home_team: { name: string; logo?: string };
  away_team: { name: string; logo?: string };
  score: { home: number | null; away: number | null };
  elapsed?: number;
  league: string;
  status: string;
}

export default function LiveMatchesList({ matches, loading }: { matches: Match[]; loading: boolean }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <span className="live-dot"></span>
        En vivo ahora
      </h2>

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <Activity size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay partidos en vivo</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {matches.slice(0, 6).map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-3 hover:bg-white/3 transition-colors"
              >
                <p className="text-xs text-gray-600 mb-1">{match.league}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white font-medium truncate flex-1">
                    {match.home_team?.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-white font-mono">
                      {match.score?.home ?? "-"}
                    </span>
                    <span className="text-gray-600 text-xs">:</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {match.score?.away ?? "-"}
                    </span>
                  </div>
                  <span className="text-xs text-white font-medium truncate flex-1 text-right">
                    {match.away_team?.name}
                  </span>
                </div>
                {match.elapsed && (
                  <div className="text-xs text-red-400 mt-0.5 font-mono">
                    {match.elapsed}&apos;
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
