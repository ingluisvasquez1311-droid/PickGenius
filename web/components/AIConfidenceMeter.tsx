"use client";

import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface AIConfidenceMeterProps {
    confidence: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function AIConfidenceMeter({
    confidence,
    size = 'md',
    showLabel = true
}: AIConfidenceMeterProps) {
    const [displayConfidence, setDisplayConfidence] = useState(0);

    // Animate counter on mount
    useEffect(() => {
        const duration = 1000; // 1 second
        const steps = 50;
        const increment = confidence / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= confidence) {
                setDisplayConfidence(confidence);
                clearInterval(timer);
            } else {
                setDisplayConfidence(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [confidence]);

    // Determine color based on confidence level for the label and glow
    const getColorClass = (conf: number) => {
        if (conf >= 75) return 'text-green-400';
        if (conf >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getGlowColor = (conf: number) => {
        if (conf >= 75) return 'rgba(34, 197, 94, 0.5)';
        if (conf >= 50) return 'rgba(234, 179, 8, 0.5)';
        return 'rgba(239, 68, 68, 0.5)';
    };

    // Size variants
    const sizes = {
        sm: { radius: 30, stroke: 4, fontSize: 'text-lg' },
        md: { radius: 45, stroke: 6, fontSize: 'text-2xl' },
        lg: { radius: 60, stroke: 8, fontSize: 'text-4xl' }
    };

    const { radius, stroke, fontSize } = sizes[size];
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (displayConfidence / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2 group/meter">
            <div className="relative inline-flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover/meter:opacity-100 transition-opacity duration-700 animate-pulse-slow"></div>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90 relative z-10"
                >
                    <defs>
                        <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#eab308" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background circle */}
                    <circle
                        stroke="rgba(255, 255, 255, 0.05)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="group-hover/meter:stroke-white/10 transition-colors"
                    />

                    {/* Progress circle */}
                    <circle
                        stroke="url(#confidenceGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        filter="url(#glow)"
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 10px ${getGlowColor(displayConfidence)})`,
                            opacity: 0.9
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={clsx(fontSize, 'font-black italic transition-colors duration-1000 tracking-tighter drop-shadow-md', getColorClass(displayConfidence))}>
                        {displayConfidence}%
                    </span>
                    {size === 'lg' && (
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">WIN RATE</span>
                    )}
                </div>
            </div>
            {showLabel && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm group-hover/meter:bg-white/10 transition-all">
                    <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", getColorClass(displayConfidence).replace('text-', 'bg-'))}></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover/meter:text-gray-200 transition-colors">
                        Confianza IA
                    </p>
                </div>
            )}
        </div>
    );
}
