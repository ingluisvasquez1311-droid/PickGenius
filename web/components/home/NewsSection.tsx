'use client';

import React, { useEffect, useState } from 'react';
import { getLatestNews, NewsItem } from '@/lib/newsService';

export default function NewsSection() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch from our new internal API which handles RSS + AI
                const response = await fetch('/api/news/live');
                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setNews(result.data);
                } else {
                    // Fallback to mock if API fails
                    const mockData = await getLatestNews();
                    setNews(mockData);
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
                // Fallback on error
                const mockData = await getLatestNews();
                setNews(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();

        // Auto-refresh every 10 minutes
        const interval = setInterval(fetchNews, 600000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="py-12 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-8 w-1 bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-[#111] rounded-xl border border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 border-t border-white/5 relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-8 w-1 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white">
                        Radar <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Info-Betting</span>
                    </h2>
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30 animate-pulse">
                        LIVE FEED
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <div key={item.id} className="group relative bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                            {/* Image Overlay */}
                            <div className="h-40 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10"></div>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                                />
                                <div className="absolute top-2 right-2 z-20 bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-300">
                                    {item.source}
                                </div>
                            </div>

                            <div className="p-5 relative z-20 -mt-10">
                                <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-green-400 transition-colors">
                                    {item.title}
                                </h3>

                                {/* AI Analysis Box */}
                                {item.aiAnalysis && (
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                                                👾 AI Insight
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.aiAnalysis.impactScore > 80 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                Impacto: {item.aiAnalysis.impactScore}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 font-medium leading-relaxed border-l-2 border-purple-500 pl-2">
                                            {item.aiAnalysis.bettingSignal}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
