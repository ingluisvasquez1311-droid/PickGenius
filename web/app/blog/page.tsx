'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { blogService, BlogArticle } from '@/lib/services/blogService';
import { Calendar, User, Clock, ChevronRight, Hash, Search } from 'lucide-react';

export default function BlogPage() {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchArticles = async () => {
            const data = await blogService.getArticles();
            setArticles(data);
            setLoading(false);
        };
        fetchArticles();
    }, []);

    // Mock articles if empty (Initial seed state)
    const displayArticles = articles.length > 0 ? articles : [
        {
            id: '1',
            slug: 'estrategia-nba-2024',
            title: 'Dominando la Temporada NBA 2024: Análisis de Tendencias',
            excerpt: 'Descubre cómo el ritmo de juego (Pace) está afectando las líneas de puntos totales en la NBA este año.',
            author: 'Luis Vasquez',
            category: 'Analysis',
            coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200',
            publishedAt: { toDate: () => new Date() },
            tags: ['NBA', 'Estrategia', 'Análisis']
        },
        {
            id: '2',
            slug: 'mejor-jugador-valor-nfl',
            title: 'Top 5 Jugadores con Mejor Valor en Props de NFL',
            excerpt: 'Analizamos las yardas por aire y tierra para encontrar las ventajas matemáticas más grandes de la semana.',
            author: 'Oracle Team',
            category: 'News',
            coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200',
            publishedAt: { toDate: () => new Date() },
            tags: ['NFL', 'Props', 'Valor']
        }
    ];

    const categories = ['All', 'Analysis', 'News', 'Tutorial'];

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-20">
            {/* HERO SECTION */}
            <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-[#050505] to-[#050505] z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2000')] bg-cover bg-center opacity-30 grayscale" />

                <div className="container mx-auto px-6 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-2xl">
                            Genius <span className="text-purple-500">Insights</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base font-medium tracking-wide uppercase">
                            Análisis elite, noticias de última hora y estrategias avanzadas para el apostador profesional.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-20 relative z-30">
                {/* SEARCH & FILTERS */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                {cat === 'All' ? 'Todos' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs focus:outline-none focus:border-purple-500/50 transition-all pl-12"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                </div>

                {/* FEATURED POST (Full Width) */}
                {displayArticles.slice(0, 1).map((article: any) => (
                    <Link key={article.id} href={`/blog/${article.slug}`} className="group relative block mb-12">
                        <div className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            <div className="absolute bottom-10 left-10 right-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                                        {article.category}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px]">
                                        <Calendar className="w-3 h-3" />
                                        {article.publishedAt.toDate().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 group-hover:text-purple-400 transition-colors leading-tight">
                                    {article.title}
                                </h2>
                                <p className="text-gray-300 text-sm md:text-base max-w-2xl line-clamp-2">
                                    {article.excerpt}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* ARTICLE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayArticles.slice(1).map((article: any) => (
                        <Link key={article.id} href={`/blog/${article.slug}`} className="group flex flex-col h-full">
                            <div className="relative h-64 rounded-[2rem] overflow-hidden border border-white/10 mb-6">
                                <Image
                                    src={article.coverImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Leer Ahora
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-purple-500 font-black text-[9px] uppercase tracking-widest">
                                    {article.category}
                                </span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">
                                    {article.author}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                            </h3>

                            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                                    <Calendar className="w-3 h-3" />
                                    {article.publishedAt.toDate().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                                    <Clock className="w-3 h-3" />
                                    5 min lectura
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* NEWSLETTER PRE-FOOTER */}
                <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

                    <h2 className="text-3xl font-black uppercase mb-4 relative z-10">¿Quieres recibir análisis VIP?</h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 relative z-10">
                        Suscríbete a nuestra newsletter para recibir los mejores pronósticos de la semana directamente en tu correo.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto relative z-10">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                        />
                        <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5">
                            Suscribirme
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
