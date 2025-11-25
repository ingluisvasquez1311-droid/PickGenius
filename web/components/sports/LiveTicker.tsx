'use client';

import React from 'react';

'use client';

export default function LiveTicker() {
  return (
    <div className="w-full bg-[var(--bg-dark)] border-b border-[rgba(255,255,255,0.05)] overflow-hidden py-2">
      <div className="flex whitespace-nowrap animate-scroll">
        {/* Ticker Items */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 mx-8 text-sm">
            <span className="font-bold text-[var(--danger)]">LIVE</span>
            <span className="text-[var(--text-muted)]">Lakers 89 - 85 Warriors</span>
            <span className="text-[var(--accent)] font-mono">Q4 2:30</span>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]"></div>

            <span className="font-bold text-[var(--text-muted)]">FINAL</span>
            <span>Real Madrid 3 - 1 Barcelona</span>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]"></div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
