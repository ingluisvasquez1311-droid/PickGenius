'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, MinusCircle, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Prediction {
    id: string;
    gameId?: string;
    pick: string;
    sport?: string;
    odds?: number;
    confidence?: number;
    status?: 'won' | 'lost' | 'push' | 'pending';
    resultScore?: string;
    timestamp: any;
    matchLabel?: string; // e.g. "Lakers vs Celtics"
}

interface Props {
    predictions: Prediction[];
    loading?: boolean;
}

export default function BetHistoryTable({ predictions, loading }: Props) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-white/5 rounded-full mb-4">
                    <Clock className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest">
                    Sin historial aún
                </h3>
            </div>
        );
    }

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'won':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Won
                    </span>
                );
            case 'lost':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Lost
                    </span>
                );
            case 'push':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                        <MinusCircle className="w-3.5 h-3.5" /> Push
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 bg-gray-500/10 px-3 py-1.5 rounded-lg border border-gray-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="space-y-3">
            {predictions.map((pred) => (
                <div
                    key={pred.id}
                    className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        {/* Sport Icon Placeholder */}
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white/40 uppercase">
                            {pred.sport?.slice(0, 2) || 'SP'}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                                    {pred.pick}
                                </h4>
                                {pred.odds && (
                                    <span className="text-[10px] font-bold text-emerald-400">
                                        @{pred.odds}
                                    </span>
                                )}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                {pred.matchLabel || 'Evento Deportivo'}
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                {pred.timestamp ? format(pred.timestamp?.toDate ? pred.timestamp.toDate() : new Date(pred.timestamp), 'd MMM', { locale: es }) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {pred.resultScore && (
                            <div className="text-right hidden sm:block">
                                <div className="text-[8px] text-gray-500 uppercase font-black">Score</div>
                                <div className="text-xs font-bold text-white font-mono">{pred.resultScore}</div>
                            </div>
                        )}

                        {getStatusBadge(pred.status)}

                        {pred.gameId && (
                            <Link
                                href={`/match/${pred.sport || 'football'}/${pred.gameId}`}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
