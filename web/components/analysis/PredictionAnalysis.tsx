import React from 'react';
import AttributeGraph from './AttributeGraph';

interface PredictionAnalysisProps {
    homeTeam: string;
    awayTeam: string;
    analysis: string;
    factors: string[];
    attributes?: {
        home: { attack: number; defense: number; form: number; h2h: number; motivation: number };
        away: { attack: number; defense: number; form: number; h2h: number; motivation: number };
    };
}

export default function PredictionAnalysis({
    homeTeam,
    awayTeam,
    analysis,
    factors,
    attributes
}: PredictionAnalysisProps) {
    // Default mock attributes if not provided
    const defaultAttributes = {
        home: { attack: 75, defense: 60, form: 80, h2h: 50, motivation: 90 },
        away: { attack: 65, defense: 70, form: 60, h2h: 50, motivation: 70 }
    };

    const finalAttributes = attributes || defaultAttributes;

    return (
        <div className="space-y-6">
            {/* Visual Graph */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-[rgba(255,255,255,0.05)]">
                <h4 className="font-bold text-center mb-4 text-sm uppercase tracking-wider text-[var(--text-muted)]">
                    Comparativa de Atributos
                </h4>

                <AttributeGraph
                    homeAttributes={finalAttributes.home}
                    awayAttributes={finalAttributes.away}
                />

                <div className="flex justify-center gap-6 mt-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--primary)] opacity-50"></div>
                        <span>{homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--secondary)] opacity-50"></div>
                        <span>{awayTeam}</span>
                    </div>
                </div>
            </div>

            {/* Text Analysis */}
            <div>
                <h4 className="font-bold mb-2">Análisis Detallado</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{analysis}</p>
            </div>

            {/* Key Factors */}
            <div>
                <h4 className="font-bold mb-3">Factores Clave</h4>
                <div className="grid grid-cols-1 gap-2">
                    {factors.map((factor, index) => (
                        <div key={index} className="flex items-start gap-3 bg-[rgba(255,255,255,0.03)] p-3 rounded-lg">
                            <span className="text-[var(--success)] font-bold">✓</span>
                            <span className="text-sm text-[var(--text-secondary)]">{factor}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
