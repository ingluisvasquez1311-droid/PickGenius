'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export default function PremiumButton({
    children,
    onClick,
    variant = 'primary',
    className = '',
    loading = false,
    type = 'submit',
    disabled = false
}: PremiumButtonProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        secondary: 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
    };

    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={`
                px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest
                transition-all duration-300 flex items-center justify-center gap-2
                ${variants[variant]}
                ${className}
                ${(loading || disabled) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
        >
            {loading && (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {children}
        </motion.button>
    );
}
