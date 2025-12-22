'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    delay?: number;
}

export default function GlassCard({ children, className = '', hover = true, delay = 0 }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={hover ? { y: -4, borderColor: 'rgba(168, 85, 247, 0.4)' } : {}}
            className={`
                bg-white/[0.03] backdrop-blur-xl border border-white/5 
                rounded-[1.5rem] shadow-2xl relative overflow-hidden transition-all duration-300
                ${className}
            `}
        >
            {/* Ambient Shine */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
}
