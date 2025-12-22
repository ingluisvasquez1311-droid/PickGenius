'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const sports = [
    { id: 'tennis', name: 'Tenis', icon: '🎾', href: '/tennis', color: 'bg-green-500' },
    { id: 'american-football', name: 'NFL', icon: '🏈', href: '/american-football', color: 'bg-brown-600' },
    { id: 'baseball', name: 'Béisbol', icon: '⚾', href: '/baseball', color: 'bg-blue-400' },
    { id: 'nhl', name: 'Hockey', icon: '🏒', href: '/nhl', color: 'bg-gray-400' },
];

export default function SportsGrid() {
    return (
        <section className="py-20 bg-black/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-12">
                    <span className="h-px w-12 bg-purple-500"></span>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Más Deportes</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sports.map((sport) => (
                        <Link key={sport.id} href={sport.href}>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="glass-card p-8 text-center group cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all bg-white/[0.02] rounded-[2.5rem]"
                            >
                                <div className={`w-16 h-16 ${sport.color}/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {sport.icon}
                                </div>
                                <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400 group-hover:text-white transition-colors">
                                    {sport.name}
                                </h3>
                                <div className="mt-4 text-[9px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                    Explorar →
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
