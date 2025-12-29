'use client';

import React, { useState } from 'react';
import ParleyOptimizerModal from './ParleyOptimizerModal';

interface ParleyOptimizerBannerProps {
    className?: string;
}

export default function ParleyOptimizerBanner({ className = "" }: ParleyOptimizerBannerProps) {
    const [showStrategies, setShowStrategies] = useState(false);

    return (
        <>
            <div className={`bg-gradient-to-br from-orange-600 to-amber-700 rounded-[2rem] p-6 text-white shadow-xl ${className}`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Power Ranking PickGenius</h4>
                <p className="text-2xl font-black italic leading-tight mb-4">OPTIMIZACIÓN DE PARLEYS EN TIEMPO REAL</p>
                <button
                    onClick={() => setShowStrategies(true)}
                    className="text-[10px] font-black uppercase tracking-widest bg-black/20 hover:bg-black/40 px-4 py-2 rounded-lg transition-colors"
                >
                    Ver Estrategias ↗
                </button>
            </div>

            <ParleyOptimizerModal
                isOpen={showStrategies}
                onClose={() => setShowStrategies(false)}
            />
        </>
    );
}
