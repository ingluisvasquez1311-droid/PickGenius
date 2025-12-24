'use client';

import React, { useState } from 'react';
import { useBettingSlip } from '@/contexts/BettingSlipContext';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function BettingSlip() {
    const { bets, removeFromSlip, clearSlip, isOpen, toggleSlip } = useBettingSlip();
    const { user, saveParley } = useAuth();
    const [wager, setWager] = useState<string>('10');
    const [selectedHouse, setSelectedHouse] = useState<string>('betano');

    const bettingHouses = [
        { id: 'betano', name: 'Betano', url: 'https://www.betano.com.co/', color: 'from-yellow-600 to-orange-600' },
        { id: 'betplay', name: 'BetPlay', url: 'https://www.betplay.com.co/', color: 'from-green-600 to-emerald-600' },
        { id: 'rushbet', name: 'Rushbet', url: 'https://www.rushbet.co/', color: 'from-blue-600 to-cyan-600' },
        { id: 'bet365', name: 'Bet365', url: 'https://www.bet365.com/', color: 'from-green-600 to-green-700' },
    ];

    if (!isOpen && bets.length === 0) {
        return null;
    }

    // Calculate totals
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    const potentialReturn = (parseFloat(wager) || 0) * totalOdds;

    const handlePlaceBet = () => {
        const selectedHouseData = bettingHouses.find(h => h.id === selectedHouse);

        if (selectedHouseData) {
            // Open betting house in new tab (preserves PickGenius session)
            window.open(selectedHouseData.url, '_blank', 'noopener,noreferrer');

            // Show success message
            toast.success('Redirigiendo a ' + selectedHouseData.name, {
                description: `Tu ticket se mantiene guardado. Ganancia Potencial: $${potentialReturn.toFixed(2)}`
            });

            // Trigger visual feedback
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#ffffff', '#eab308'],
                zIndex: 9999
            });

            // --- NEW: Save Ticket to History ---
            if (user) {
                saveParley({
                    selections: bets,
                    totalOdds,
                    wager,
                    potentialReturn,
                    house: selectedHouseData.name,
                    status: 'active'
                }).catch(err => console.error('Error saving parley:', err));
            }
        }

        // NOTE: We do NOT clear the slip automatically
        // User must manually clear it with the trash button
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && bets.length > 0 && (
                <button
                    onClick={toggleSlip}
                    className="fixed bottom-6 right-6 z-[60] group mobile-haptic"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    <div className="relative bg-[#0a0a0a] border border-white/20 text-white font-bold py-3 px-5 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95">
                        <span className="text-xl">🎫</span>
                        <span className="font-bold">Ticket</span>
                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {bets.length}
                        </span>
                    </div>
                </button>
            )}

            {/* Slip Panel - Brutal Glass */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[60] w-[90vw] md:w-96 glass-brutal rounded-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                    {/* Header */}
                    <div className="bg-white/5 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10">
                        <div className="font-bold flex items-center gap-2 text-white">
                            <span className="text-xl">🎫</span>
                            <span className="tracking-tight">Ticket de Apuesta</span>
                            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-500/30">
                                {bets.length}
                            </span>
                        </div>
                        <button
                            onClick={toggleSlip}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Bets List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {bets.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center gap-3">
                                <div className="text-4xl opacity-20">📊</div>
                                <div className="text-gray-500 text-sm font-medium">
                                    Tu ticket está vacío.
                                    <br />
                                    Selecciona una cuota para jugar.
                                </div>
                            </div>
                        ) : (
                            bets.map((bet) => (
                                <div key={bet.id} className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 relative group transition-all duration-200">
                                    <button
                                        onClick={() => removeFromSlip(bet.id)}
                                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        ✕
                                    </button>
                                    <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{bet.matchLabel}</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="font-bold text-white text-lg leading-tight">
                                                {bet.selection}
                                            </div>
                                            <div className="text-[10px] text-purple-400 mt-1 uppercase font-bold tracking-wider">{bet.market}</div>
                                        </div>
                                        <div className="bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded text-sm font-mono font-bold text-purple-300">
                                            {bet.odds.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Calculations */}
                    {bets.length > 0 && (
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl p-5 border-t border-white/10">

                            {/* Wager Input */}
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-400">Apuesta ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={wager}
                                        onChange={(e) => setWager(e.target.value)}
                                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-6 text-right font-mono text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Cuota Total</span>
                                    <span className="font-bold text-white">{totalOdds.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">Ganancia Potencial</span>
                                    <span className="font-bold text-green-400 text-lg">${potentialReturn.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Betting House Selector */}
                            <div className="mb-5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Casa de Apuestas</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {bettingHouses.map((house) => (
                                        <button
                                            key={house.id}
                                            onClick={() => setSelectedHouse(house.id)}
                                            className={`p-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedHouse === house.id
                                                ? `bg-gradient-to-r ${house.color} border-white/30 text-white scale-105`
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            {house.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={clearSlip}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors mobile-haptic"
                                    title="Limpiar Ticket"
                                >
                                    🗑️
                                </button>

                                <button
                                    onClick={() => {
                                        const slipText = [
                                            "🎫 *Ticket PickGenius*",
                                            ...bets.map(b => `• ${b.selection} (@${b.odds.toFixed(2)}) - ${b.matchLabel}`),
                                            `💰 *Cuota Total:* ${totalOdds.toFixed(2)}`,
                                            `🎯 *Potencial:* $${potentialReturn.toFixed(2)}`
                                        ].join("\n");

                                        navigator.clipboard.writeText(slipText);
                                        toast.success("¡Ticket copiado al portapapeles!", { icon: "📋" });
                                    }}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/10 hover:text-blue-400 text-gray-400 transition-colors mobile-haptic"
                                    title="Copiar Ticket"
                                >
                                    📋
                                </button>

                                <button
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 flex justify-center items-center gap-2 group mobile-haptic"
                                    onClick={handlePlaceBet}
                                >
                                    <span>Realizar Apuesta</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
