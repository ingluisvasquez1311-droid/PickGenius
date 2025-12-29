import React from 'react';

interface PredictionCardProps {
    title: string;
    description: string;
    sport: 'NBA' | 'Fútbol';
    confidence: number;
    odds?: string;
    wizardTip: string;
}

export default function PredictionCard({
    title,
    description,
    sport,
    confidence,
    odds,
    wizardTip
}: PredictionCardProps) {
    return (
        <div className="glass-card p-6 relative overflow-hidden border-t-4 border-[var(--secondary)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🧙‍♂️</div>

            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold bg-[rgba(112,0,255,0.2)] text-[var(--secondary)] px-2 py-1 rounded">
                    {sport}
                </span>
                {odds && <span className="text-[var(--success)] font-mono font-bold">{odds}</span>}
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">{description}</p>

            <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">✨</span>
                    <span className="font-bold text-[var(--accent)]">El Consejo del Mago</span>
                </div>
                <p className="text-sm italic text-[var(--text-primary)]">"{wizardTip}"</p>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)]"
                        style={{ width: `${confidence}%` }}
                    ></div>
                </div>
                <span className="text-xs font-bold">{confidence}% Confianza</span>
            </div>
        </div>
    );
}
