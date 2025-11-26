'use client';

import React, { useState } from 'react';
import { useBettingSlip } from '@/contexts/BettingSlipContext';

export default function BettingSlip() {
    const { bets, removeFromSlip, clearSlip, isOpen, toggleSlip } = useBettingSlip();
    const [wager, setWager] = useState<string>('10'); // Default wager

    if (!isOpen && bets.length === 0) {
        return null; // Hide completely if empty and closed? Or maybe show a floating button always?
        // Let's show a floating button if there are bets, or if it's closed but has bets.
    }

    // Calculate totals
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    const potentialReturn = (parseFloat(wager) || 0) * totalOdds;

    return (
        <>
            {/* Floating Toggle Button (Visible when closed or has bets) */}
            {!isOpen && bets.length > 0 && (
                <button
                    onClick={toggleSlip}
                    className="fixed bottom-4 right-4 z-50 bg-[var(--primary)] text-black font-bold py-3 px-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 animate-bounce-in"
                >
                    <span>🎫 Ticket</span>
                    <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {bets.length}
                    </span>
                </button>
            )}

            {/* Slip Panel */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-10 fade-in duration-200">

                    {/* Header */}
                    <div className="bg-[var(--primary)] text-black p-3 flex justify-between items-center">
                        <div className="font-bold flex items-center gap-2">
                            🎫 Ticket de Apuesta
                            <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {bets.length}
                            </span>
                        </div>
                        <button onClick={toggleSlip} className="hover:bg-black/10 rounded p-1">
                            ✕
                        </button>
                    </div>

                    {/* Bets List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {bets.length === 0 ? (
                            <div className="text-center text-[var(--text-muted)] py-8">
                                Tu ticket está vacío.
                                <br />
                                Selecciona una cuota para empezar.
                            </div>
                        ) : (
                            bets.map((bet) => (
                                <div key={bet.id} className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 relative group">
                                    <button
                                        onClick={() => removeFromSlip(bet.id)}
                                        className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                    <div className="text-xs text-[var(--text-muted)] mb-1">{bet.matchLabel}</div>
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold text-sm text-[var(--primary)]">
                                            {bet.selection}
                                        </div>
                                        <div className="bg-black/30 px-2 py-1 rounded text-xs font-mono font-bold">
                                            {bet.odds.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)] mt-1 uppercase">{bet.market}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Calculations */}
                    {bets.length > 0 && (
                        <div className="bg-[rgba(0,0,0,0.3)] p-4 border-t border-[rgba(255,255,255,0.1)]">

                            {/* Wager Input */}
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs text-[var(--text-muted)]">Apuesta ($)</label>
                                <input
                                    type="number"
                                    value={wager}
                                    onChange={(e) => setWager(e.target.value)}
                                    className="w-20 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-right font-mono text-sm focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            {/* Totals */}
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="text-[var(--text-muted)]">Cuota Total:</span>
                                <span className="font-bold text-[var(--accent)]">{totalOdds.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4 text-sm">
                                <span className="text-[var(--text-muted)]">Ganancia Potencial:</span>
                                <span className="font-bold text-[var(--success)]">${potentialReturn.toFixed(2)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={clearSlip}
                                    className="px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-xs font-bold transition-colors"
                                >
                                    🗑️
                                </button>
                                <button
                                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-black font-bold py-2 rounded transition-colors text-sm"
                                    onClick={() => alert('¡Apuesta simulada realizada con éxito! (Esto es una demo)')}
                                >
                                    Simular Apuesta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
