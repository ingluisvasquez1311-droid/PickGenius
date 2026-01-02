import React from 'react';
import clsx from 'clsx';

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-4xl"
    };

    return (
        <div className={clsx("flex items-center gap-2 select-none group", className)}>
            {/* Logomark */}
            <div className={clsx("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Glow Background */}
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full group-hover:blur-xl transition-all duration-500"></div>

                {/* SVG Icon: Brain + Lightning */}
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 overflow-visible">
                    <defs>
                        <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" /> {/* Violet */}
                            <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Brain Circuitry Left */}
                    <path
                        d="M50 20 C 35 20, 20 35, 20 50 C 20 65, 30 75, 40 78"
                        fill="none"
                        stroke="url(#cyber-grad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="opacity-80"
                        filter="url(#glow)"
                    />
                    <path
                        d="M30 40 L 40 40 L 40 50"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-60"
                    />

                    {/* Brain Circuitry Right */}
                    <path
                        d="M50 20 C 65 20, 80 35, 80 50 C 80 65, 70 75, 60 78"
                        fill="none"
                        stroke="url(#cyber-grad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="opacity-80"
                        filter="url(#glow)"
                    />
                    <path
                        d="M60 40 L 70 40 L 60 60"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-40"
                    />

                    {/* Lightning Bolt Center - "The Spark" */}
                    <path
                        d="M55 10 L 35 50 L 50 50 L 45 90 L 65 45 L 50 45 Z"
                        fill="#fff"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        filter="url(#glow)"
                        className="animate-pulse-slow drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transform origin-center group-hover:scale-110 transition-transform duration-300"
                    />
                </svg>
            </div>

            {/* Typography */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <h1 className={clsx("font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-shine", textSizeClasses[size])}>
                        PICK<span className="text-primary">GENIUS</span>
                    </h1>
                </div>
            )}
        </div>
    );
};
