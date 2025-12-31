"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import clsx from 'clsx';

const testimonials = [
    {
        stars: 5,
        text: "He aumentado mis ganancias en un 300% desde que uso PickGenius. La IA es simplemente imbatible.",
        author: "Carlos M.",
        role: "Inversionista Deportivo",
        tag: "Premium 6 meses"
    },
    {
        stars: 5,
        text: "Las predicciones en vivo son una locura. Detecta el cambio de momentum antes que los narradores.",
        author: "Ana R.",
        role: "Estratega Junior",
        tag: "Premium 1 año"
    },
    {
        stars: 5,
        text: "La interfaz es increíble, pero lo que realmente vale es el ROI constante. 40% mensual verificado.",
        author: "Miguel P.",
        role: "Pro Analyst",
        tag: "Premium 3 meses"
    },
    {
        stars: 5,
        text: "El sistema de alertas de Value Bets me ha dado una ventaja competitiva masiva. Imprescindible.",
        author: "Javier L.",
        role: "Full-time Bettor",
        tag: "Elite Hub"
    }
];

export const TestimonialSlider = () => {
    const [index, setIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setIndex((prev) => (prev + 1) % testimonials.length);
    }, []);

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <div className="space-y-12">
            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-700 ease-in-out gap-8"
                    style={{ transform: `translateX(calc(-${index * 100}% - ${index * 32}px))` }}
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="min-w-full md:min-w-[450px] p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] hover:bg-primary/5 hover:border-primary/20 transition-all space-y-6"
                        >
                            <div className="flex gap-1">
                                {[...Array(t.stars)].map((_, idx) => (
                                    <Star key={idx} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                            <p className="text-xl md:text-2xl font-medium italic text-gray-300 leading-relaxed italic">
                                "{t.text}"
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div>
                                    <div className="font-black italic uppercase tracking-tighter text-white">{t.author}</div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.role}</div>
                                </div>
                                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                    {t.tag}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={prevSlide}
                    className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-center gap-2">
                {testimonials.map((_, i) => (
                    <div
                        key={i}
                        className={clsx(
                            "h-1 transition-all rounded-full",
                            index === i ? "w-8 bg-primary" : "w-4 bg-white/10"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};
