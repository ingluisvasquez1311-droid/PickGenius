"use client";

import { useState } from 'react';
import {
    Swords, Trophy, User, Bot,
    TrendingUp, CheckCircle2, XCircle,
    AlertCircle, Crown
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Mock active challenges
const MOCK_CHALLENGES = [
    { id: 1, user: "TraderMax", pick: "Lakers -5.5", status: "winning", aiStatus: "losing", stake: 500 },
    { id: 2, user: "CryptoKing", pick: "Real Madrid ML", status: "losing", aiStatus: "winning", stake: 1200 },
    { id: 3, user: "AlphaBet", pick: "Over 2.5 Goals", status: "winning", aiStatus: "winning", stake: 200 } // Tie scenario
];

export default function PicksArenaWidget() {
    const [activeTab, setActiveTab] = useState<'live' | 'create'>('live');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [wager, setWager] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duelCreated, setDuelCreated] = useState(false);

    const handleDuel = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setDuelCreated(true);
            setTimeout(() => setDuelCreated(false), 3000); // Reset after success
        }, 1500);
    };

    return (
        <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-red-900/10 to-transparent flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Swords className="w-5 h-5 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic uppercase text-white tracking-wider">Arena de Duelos</h3>
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Human vs Machine</p>
                    </div>
                </div>
                <div className="flex bg-black/40 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={clsx(
                            "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'live' ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                    >
                        En Vivo
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={clsx(
                            "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'create' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                    >
                        Desafiar
                    </button>
                </div>
            </div>

            <div className="p-6 min-h-[300px] relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'live' ? (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {MOCK_CHALLENGES.map((duel) => (
                                <div key={duel.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <div className={clsx(
                                                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black",
                                                duel.status === 'winning' ? "bg-green-500" : "bg-red-500"
                                            )}></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase">{duel.user}</p>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{duel.pick}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center px-4">
                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">VS</span>
                                        <div className="h-px w-8 bg-white/10 my-1"></div>
                                        <span className="text-[9px] font-mono text-gray-400">{duel.stake} PGc</span>
                                    </div>

                                    <div className="flex items-center gap-3 flex-row-reverse text-right">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className={clsx(
                                                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black",
                                                duel.aiStatus === 'winning' ? "bg-green-500" : "bg-red-500"
                                            )}></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase">AlphaZero</p>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Contra-Pick</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center pt-2">
                                <p className="text-[9px] font-mono text-gray-600 animate-pulse">Sincronizando duelos globales...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {duelCreated ? (
                                <div className="h-full flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                        <Crown className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h4 className="text-xl font-black italic uppercase text-white">¡Duelo Iniciado!</h4>
                                    <p className="text-xs text-gray-400 text-center px-8">La IA ha aceptado tu desafío. Recibirás una notificación cuando el partido termine.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tu Predicción</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Lakers Ganador"
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold text-white placeholder:text-gray-700 focus:border-red-500/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Apuesta (PGc)</label>
                                        <div className="flex items-center gap-4">
                                            {[100, 500, 1000].map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => setWager(amt)}
                                                    className={clsx(
                                                        "flex-1 py-3 rounded-xl text-xs font-black border transition-all",
                                                        wager === amt ? "bg-white text-black border-white" : "bg-white/5 text-gray-500 border-white/5 hover:bg-white/10"
                                                    )}
                                                >
                                                    {amt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-[10px] font-medium text-red-200/60 leading-relaxed">
                                            Si ganas, obtienes <span className="text-white font-black">2x Créditos</span> y +50 XP de Ranking. Si pierdes, la IA absorbe tu apuesta.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleDuel}
                                        disabled={!selectedTeam || isSubmitting}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                                    >
                                        {isSubmitting ? (
                                            <span className="animate-pulse">Negociando...</span>
                                        ) : (
                                            <>
                                                Lanzar Guante <Swords className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
