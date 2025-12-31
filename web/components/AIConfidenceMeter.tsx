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
        <div className="flex flex-col items-center gap-2">
            <div className="relative inline-flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <defs>
                        <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                            <stop offset="50%" stopColor="#eab308" /> {/* Yellow */}
                            <stop offset="100%" stopColor="#22c55e" /> {/* Green */}
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background circle */}
                    <circle
                        stroke="rgba(255, 255, 255, 0.1)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
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
                        style={{ filter: `drop-shadow(0 0 5px ${getGlowColor(displayConfidence)})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={clsx(fontSize, 'font-black italic transition-colors duration-1000', getColorClass(displayConfidence))}>
                        {displayConfidence}%
                    </span>
                </div>
            </div>
            {showLabel && (
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Confianza IA
                </p>
            )}
        </div>
    );
}
