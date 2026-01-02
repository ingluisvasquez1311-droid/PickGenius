"use client";

import { blogPosts } from '@/data/blogPosts';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Hash, Share2, Twitter, Facebook } from 'lucide-react';
import Link from 'next/link';

interface BlogPostProps {
    params: {
        slug: string;
    };
}

export default function BlogPostPage({ params }: BlogPostProps) {
    const post = blogPosts.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 w-full h-[60vh]">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-[#050505]" />
                    <img
                        src={post.imageUrl}
                        alt="Background"
                        className="w-full h-full object-cover opacity-20 blur-xl"
                    />
                </div>
            </div>

            <article className="relative z-10 max-w-4xl mx-auto space-y-12">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Blog
                </Link>

                {/* Hero Header */}
                <div className="space-y-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-tight tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-y border-white/5 py-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                            <span>{post.author}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl">
                    <div
                        className="prose prose-invert prose-lg max-w-none 
                        prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter
                        prose-p:text-gray-400 prose-p:font-medium prose-p:leading-loose
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                        prose-strong:text-white prose-strong:font-black
                        prose-ul:text-gray-400 prose-li:marker:text-blue-500"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Tags & Share */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <Hash className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Compartir:</p>
                        <button className="p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-xl transition-colors">
                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                        </button>
                        <button className="p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-xl transition-colors">
                            <Facebook className="w-4 h-4 text-[#1877F2]" />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                            <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
}
