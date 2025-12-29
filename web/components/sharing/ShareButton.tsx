'use client';

import React, { useState, useRef } from 'react';
import { Download, Share2, Loader2, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PredictionTicket } from './PredictionTicket';
import { createPortal } from 'react-dom';
import { trackShare } from '@/lib/analytics';

interface ShareButtonProps {
    data: {
        player: {
            name: string;
            team: string;
            image?: string;
        } | null;
        match?: {
            homeTeam: string;
            awayTeam: string;
            time: string;
            tournament: string;
        };
        prediction: {
            type: string;
            line: number;
            prediction: 'Over' | 'Under';
            probability: number;
        };
    };
}

export default function ShareButton({ data }: ShareButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        setLoading(true);

        try {
            // We wait a bit for images to load if needed, though they should be cached
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 3 });

            const link = document.createElement('a');
            link.download = `pickgenius-prediction-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            // Track share event
            trackShare({
                sport: data.match?.tournament || 'unknown',
                playerName: data.player?.name || 'unknown',
                probability: data.prediction.probability
            });

            setShowPreview(false);
        } catch (err) {
            console.error('Error generating image:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowPreview(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
                title="Compartir Predicción"
            >
                <Share2 className="w-5 h-5" />
            </button>

            {showPreview && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">

                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black italic uppercase text-white mb-2">Compartir Ticket</h3>
                            <p className="text-xs text-gray-400">Genera una imagen viral de esta predicción.</p>
                        </div>

                        {/* Ticket Rendering Area - Centered */}
                        <div className="flex justify-center mb-8 relative">
                            {/* The actual ticket component that will be captured */}
                            <PredictionTicket ref={ticketRef} {...data} />
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" /> Descargar Imagen
                                </>
                            )}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
