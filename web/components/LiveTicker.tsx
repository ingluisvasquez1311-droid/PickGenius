"use client";

import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const NEWS_ITEMS = [
    "🚨 ÚLTIMA HORA: Lakers confirman alineación completa vs Celtics (-3.5)",
    "💰 SHARP MONEY ALERT: Entrada masiva en Chiefs Over 48.5 (Vol: $2.4M)",
    "🎾 TENIS: Djokovic rompe servicio en el 2do set (Live Odds: 1.15)",
    "📉 MERCADO: Real Madrid baja a 1.85 tras confirmación de Vinicius",
    "🔥 TRENDING: 85% del público está con Warriors hoy",
    "⚠️ LESIÓN: Giannis (Duda) calentando con molestias en la rodilla",
];

export function LiveTicker() {
    return (
        <div className="w-full bg-[#020202] border-y border-white/5 py-2.5 overflow-hidden flex relative z-50">
            <div className="px-4 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest shrink-0 border-r border-white/10 z-10 bg-[#020202]">
                <Radio className="w-3 h-3 animate-pulse" />
                Noticias
            </div>

            <div className="flex overflow-hidden relative w-full mask-linear-fade">
                <motion.div
                    className="flex gap-20 whitespace-nowrap px-10"
                    animate={{ x: ["0%", "-100%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                            {item.includes("💰") ? <span className="text-green-500">{item}</span> :
                                item.includes("🚨") ? <span className="text-red-500">{item}</span> :
                                    item}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
