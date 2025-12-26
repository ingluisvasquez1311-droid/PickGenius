'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { blogService, BlogArticle } from '@/lib/services/blogService';
import { Calendar, User, Clock, ChevronLeft, ArrowRight, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<BlogArticle | null>(null);
    const [related, setRelated] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            const data = await blogService.getArticleBySlug(slug as string);

            if (!data) {
                // Mock search for development
                const all = await blogService.getArticles();
                const mock = all.find(a => a.slug === slug) || all[0];
                setArticle(mock);
            } else {
                setArticle(data);
            }

            const features = await blogService.getFeaturedArticles();
            setRelated(features.filter(a => a.slug !== slug));
            setLoading(false);
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-4xl font-black mb-4">Artículo no encontrado</h1>
                <Link href="/blog" className="text-purple-500 hover:underline">Volver al Blog</Link>
            </div>
        );
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Enlace copiado al portapapeles');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* ARTICLE HEADER */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-6 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Volver al Blog
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/30">
                                    {article.category}
                                </span>
                                {article.sport && (
                                    <span className="px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                                        {article.sport}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter max-w-5xl mb-8">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 text-gray-400 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-black text-white text-xs">
                                        {article.author[0]}
                                    </div>
                                    <span className="font-bold text-white uppercase tracking-widest text-xs">{article.author}</span>
                                </div>
                                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    {article.publishedAt.toDate().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    8 min lectura
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* CONTENT */}
                    <div className="lg:col-span-8">
                        <article className="prose prose-invert prose-purple max-w-none">
                            <p className="text-xl md:text-2xl text-gray-300 font-medium italic mb-12 border-l-4 border-purple-500 pl-6 py-2 leading-relaxed">
                                {article.excerpt}
                            </p>

                            {/* Dummy content for presentation */}
                            <div className="space-y-8 text-gray-300 leading-relaxed text-lg">
                                <p>
                                    La analítica avanzada ha transformado la forma en que entendemos los deportes. En esta entrega, profundizamos en las métricas que realmente importan para predecir resultados con mayor precisión. No se trata solo de quién gana o pierde, sino de entender las probabilidades subyacentes.
                                </p>

                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-12 mb-6">El Factor de Eficiencia Ofensiva</h3>
                                <p>
                                    En la NBA actual, la eficiencia ofensiva (puntos anotados por cada 100 posesiones) es una métrica mucho más confiable que el promedio simple de puntos. Un equipo puede anotar 120 puntos, pero si lo hace en un ritmo de juego frenético, su eficiencia podría ser menor que la de un equipo que anota 110 en un ritmo controlado.
                                </p>

                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 my-12">
                                    <h4 className="text-purple-400 font-black uppercase text-xs tracking-[0.2em] mb-4">Dato Maestro de IA</h4>
                                    <p className="text-xl font-bold text-white italic">
                                        "El 78% de los equipos con una tasa de victoria superior al 60% también lideran en eficiencia defensiva durante el último cuarto."
                                    </p>
                                </div>

                                <p>
                                    Nuestra Inteligencia Artificial analiza más de 50,000 puntos de datos por partido para identificar estas discrepancias antes de que las casas de apuestas ajusten sus líneas. Es ahí donde reside el verdadero "Value Bet".
                                </p>

                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-12 mb-6">Conclusión Probabilística</h3>
                                <p>
                                    Para navegar con éxito en el mundo de las predicciones, es crucial separar el ruido de la señal. Las rachas emocionales son temporales; los datos son persistentes. PickGenius Pro te otorga la herramienta necesaria para ver lo que otros ignoran.
                                </p>
                            </div>

                            {/* TAGS */}
                            <div className="mt-20 pt-10 border-t border-white/10 flex flex-wrap gap-3">
                                {article.tags.map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </article>

                        {/* AUTHOR BOX */}
                        <div className="mt-16 bg-gradient-to-br from-white/5 to-transparent p-10 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-[2px] shadow-2xl">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-3xl">
                                    {article.author[0]}
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-white font-black text-xl mb-2">{article.author}</h4>
                                <p className="text-gray-400 text-sm max-w-md">
                                    Analista principal en PickGenius con más de 10 años de experiencia en modelado matemático deportivo y estrategias de bankroll.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* SHARE */}
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Compartir Artículo</h4>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleShare} className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform">
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button onClick={handleShare} className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center hover:scale-110 transition-transform">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button onClick={handleShare} className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:scale-110 transition-transform">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                                <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:scale-110 transition-transform">
                                    <Share2 className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* RELATED */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8 ml-2">Artículos Relacionados</h4>
                            <div className="space-y-6">
                                {related.map(rel => (
                                    <Link key={rel.id} href={`/blog/${rel.slug}`} className="group flex gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all">
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                                            <Image src={rel.coverImage} alt={rel.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-purple-500 text-[9px] font-black uppercase mb-1 tracking-widest">{rel.category}</span>
                                            <h5 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                                {rel.title}
                                            </h5>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* CTA PREMIUM */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-8 rounded-[2.5rem] border border-purple-500/20 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[50px] rounded-full" />
                            <h4 className="text-xl font-black mb-4 relative z-10 italic">Únete a la Élite</h4>
                            <p className="text-xs text-gray-400 mb-6 relative z-10">Obtén acceso a predicciones de IA en tiempo real y análisis exclusivos.</p>
                            <Link href="/auth/register" className="block w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-white/5 hover:scale-[1.02] transition-all relative z-10">
                                Ser Miembro Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
