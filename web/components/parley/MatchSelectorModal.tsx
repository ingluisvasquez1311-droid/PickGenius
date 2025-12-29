'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Trophy, Calendar, Zap, AlertCircle } from 'lucide-react';

interface MatchSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (match: any) => void;
}

export default function MatchSelectorModal({ isOpen, onClose, onSelect }: MatchSelectorModalProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sport, setSport] = useState<'football' | 'basketball'>('football');

    useEffect(() => {
        if (!isOpen) return;

        async function fetchMatches() {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const [scheduledRes, liveRes] = await Promise.all([
                    fetch(`/api/${sport}/scheduled?date=${today}`),
                    fetch(`/api/${sport}/live`)
                ]);

                const scheduledData = await scheduledRes.json();
                const liveData = await liveRes.json();

                let allMatchData: any[] = [];

                // Add Live first (priority)
                if (liveData.success && Array.isArray(liveData.data)) {
                    allMatchData = liveData.data.map((m: any) => ({ ...m, isLive: true }));
                }

                // Add Scheduled (filter out duplicates if any)
                if (scheduledData.success && Array.isArray(scheduledData.data)) {
                    const liveIds = new Set(allMatchData.map((m: any) => m.id));
                    const scheduledToAdd = scheduledData.data
                        .filter((m: any) => !liveIds.has(m.id))
                        .map((m: any) => ({ ...m, isLive: false }));
                    allMatchData = [...allMatchData, ...scheduledToAdd];
                }

                setMatches(allMatchData);
            } catch (error) {
                console.error("Error fetching matches for selector:", error);
                setMatches([]);
            } finally {
                setLoading(false);
            }
        }

        fetchMatches();
    }, [isOpen, sport]);

    const filteredMatches = matches.filter(m =>
        m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
        m.awayTeam.name.toLowerCase().includes(search.toLowerCase()) ||
        m.tournament.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectMatch = (match: any, option: any) => {
        onSelect({
            id: match.id.toString() + '_' + option.type + '_' + Date.now(),
            fixture: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            sport: sport === 'football' ? 'football' : 'basketball',
            selection: option.selection,
            odds: option.odds,
            aiProbability: option.aiProbability
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Seleccionar Evento Real</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cartelera de hoy en tiempo real</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSport('football')}
                            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${sport === 'football' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                        >
                            ⚽ Fútbol
                        </button>
                        <button
                            onClick={() => setSport('basketball')}
                            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${sport === 'basketball' ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                        >
                            🏀 Baloncesto
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar liga, equipo o país..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Sincronizando con Sofascore...</p>
                        </div>
                    ) : filteredMatches.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-widest">No hay partidos disponibles hoy</p>
                        </div>
                    ) : (
                        filteredMatches.map((match) => (
                            <div
                                key={match.id}
                                className={`w-full group p-4 border rounded-2xl transition-all ${match.isLive ? 'bg-red-500/[0.02] border-red-500/10 hover:bg-red-500/[0.05]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex -space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 p-1.5 overflow-hidden shadow-lg relative z-20">
                                                <img src={`/api/proxy/team-logo/${match.homeTeam.id}`} className="w-full h-full object-contain" alt="" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 p-1.5 overflow-hidden shadow-lg relative z-10">
                                                <img src={`/api/proxy/team-logo/${match.awayTeam.id}`} className="w-full h-full object-contain" alt="" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {match.isLive && (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                                                )}
                                                <div className={`text-[7px] font-black uppercase tracking-widest truncate ${match.isLive ? 'text-red-400' : 'text-gray-500'}`}>
                                                    {match.isLive ? '• EN VIVO' : ''} {match.tournament.name}
                                                </div>
                                            </div>
                                            <div className="text-xs font-black italic tracking-tighter truncate text-white uppercase">
                                                {match.homeTeam.name} <span className="text-gray-500 mx-1">vs</span> {match.awayTeam.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {match.isLive ? (
                                            <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] font-black text-white tabular-nums">
                                                    {match.homeScore?.current ?? 0}
                                                </span>
                                                <span className="text-[10px] text-red-500/50">-</span>
                                                <span className="text-[10px] font-black text-white tabular-nums">
                                                    {match.awayScore?.current ?? 0}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Inicio</div>
                                                <div className="text-[10px] font-bold text-gray-400">
                                                    {new Date(match.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: sport === 'football' ? '1' : 'Local', type: 'HOME', selection: `${match.homeTeam.name} WIN`, prob: 45 },
                                        { label: sport === 'football' ? 'X' : 'Empate', type: 'DRAW', selection: 'Empate', prob: 25 },
                                        { label: sport === 'football' ? '2' : 'Visitante', type: 'AWAY', selection: `${match.awayTeam.name} WIN`, prob: 30 }
                                    ].map((opt) => {
                                        // Simple odds calc: 1/prob * 0.95 (margin)
                                        const odds = (1 / (opt.prob / 100)) * 0.92;
                                        return (
                                            <button
                                                key={opt.label}
                                                onClick={() => onSelect({
                                                    id: match.id.toString() + '_' + opt.type + '_' + Date.now(),
                                                    fixture: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                                                    sport: sport === 'football' ? 'football' : 'basketball',
                                                    selection: opt.selection,
                                                    odds: parseFloat(odds.toFixed(2)),
                                                    aiProbability: opt.prob + Math.floor(Math.random() * 10)
                                                })}
                                                className="py-2 bg-white/5 hover:bg-purple-500 hover:text-white rounded-xl border border-white/5 text-[9px] font-black transition-all flex flex-col items-center"
                                            >
                                                <span className="opacity-60">{opt.label}</span>
                                                <span className="text-xs mt-0.5">{odds.toFixed(2)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-white/[0.01] border-t border-white/5">
                    <p className="text-[9px] text-gray-600 text-center uppercase font-bold tracking-widest">
                        Selecciona un partido para añadirlo a tu parlay inteligente.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function PlusIcon(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}
