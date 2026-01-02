"use client";

import { useState } from 'react';
import { blogPosts } from '@/data/blogPosts';
import { Search, Hash, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function BlogPage() {
    const [category, setCategory] = useState<'All' | 'NBA' | 'Football' | 'Strategy' | 'AI Analysis'>('All');
    const [search, setSearch] = useState('');

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = category === 'All' || post.category === category;
        const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', 'NBA', 'Football', 'Strategy', 'AI Analysis'];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-[180px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/10 blur-[200px] rounded-full opacity-30"></div>
            </div>

            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">PICKGENIUS INTELLIGENCE</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            BLOG <span className="text-blue-500">INSIGHTS</span>
                        </h1>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">
                            Análisis Profundo • Estrategia • Educación
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-auto relative">
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat as any)}
                            className={clsx(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent",
                                category === cat
                                    ? "bg-blue-500 text-black border-blue-500 shadow-glow-sm"
                                    : "bg-white/5 text-gray-500 hover:text-white hover:border-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <Link
                            href={`/blog/${post.slug}`}
                            key={post.id}
                            className="group block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6 relative z-20 -mt-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </div>
                                        <span>•</span>
                                        <span>{post.date}</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase leading-tight group-hover:text-blue-500 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.author}</span>
                                    </div>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="py-20 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
                            No se encontraron artículos
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
