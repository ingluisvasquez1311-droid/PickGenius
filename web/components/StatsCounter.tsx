"use client";

import React, { useEffect, useState, useRef } from 'react';

interface StatsCounterProps {
    target: number;
    label: string;
    suffix?: string;
    prefix?: string;
}

export const StatsCounter = ({ target, label, suffix = "", prefix = "" }: StatsCounterProps) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null;
        const duration = 2000;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function: easeOutExpo
            const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easing * target));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible, target]);

    return (
        <div ref={elementRef} className="stat-card p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center hover:bg-primary/10 hover:border-primary transition-all group">
            <div className="text-5xl font-black italic text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                {prefix}{count}{suffix}
            </div>
            <div className="stat-label text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-2 group-hover:text-gray-300 transition-colors">
                {label}
            </div>
        </div>
    );
};
