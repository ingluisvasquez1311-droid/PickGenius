'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SportHeaderProps {
    title: string;
    sport: string;
    emoji: string;
    color: string;
    accentColor: string;
    subtitle?: string;
}

const SPORTS_LIST = [
    { name: 'Fútbol', href: '/football-live', emoji: '⚽' },
    { name: 'Baloncesto', href: '/basketball-live', emoji: '🏀' },
    { name: 'Fútbol Americano', href: '/american-football', emoji: '🏈' },
    { name: 'Béisbol', href: '/baseball', emoji: '⚾' },
    { name: 'Hockey', href: '/nhl', emoji: '🏒' },
    { name: 'Tenis', href: '/tennis', emoji: '🎾' },
    { name: 'Props Predictor', href: '/props', emoji: '🎯' },
];

export default function SportHeader({ title, sport, emoji, color, accentColor, subtitle }: SportHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative h-64 md:h-80 overflow-hidden mb-12 flex items-center">
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-r ${color} z-0`}></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className={`absolute top-0 right-0 w-[50%] h-full ${accentColor} blur-[120px] -z-10`}></div>

            <div className="container relative z-10 w-full">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Interactive Emoji/Icon Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-20 h-20 md:w-28 md:h-28 ${color.split(' ')[1]} rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all relative group`}
                    >
                        {emoji}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black/80 rounded-full border border-white/20 flex items-center justify-center text-xs animate-bounce">
                            <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                    </button>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`h-px w-8 ${accentColor.replace('blur', '')}`}></span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${accentColor.replace('bg-', 'text-').replace('/5 ', '').replace('blur-[120px]', '')}`}>{sport} Analytics</span>
                        </div>

                        {/* Interactive Title Area */}
                        <div className="relative inline-block">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="group flex items-center gap-4 text-left p-2 -m-2 rounded-2xl hover:bg-white/5 transition-colors"
                            >
                                <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                    {title} <span className={accentColor.replace('bg-', 'text-').replace('/5 ', '').replace('blur-[120px]', '')}>ELITE</span>
                                </h1>
                                <ChevronDown className={`w-6 h-6 md:w-10 md:h-10 text-white/20 group-hover:text-white transition-all ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <p className="text-gray-400 font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase mt-3">
                            {subtitle || 'Stadium Vibes • Live Stats • Prediction IA'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Embedded Sport Selector Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute left-1/2 -bottom-24 -translate-x-1/2 w-[90%] md:w-auto min-w-[300px] z-[101] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-4 shadow-2xl"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {SPORTS_LIST.map((s) => (
                                    <Link
                                        key={s.href}
                                        href={s.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{s.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
