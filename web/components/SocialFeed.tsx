"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Send, MessageSquare, Crown, Trash2, Clock, ShieldCheck, Zap, Flag, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Image from 'next/image';
import { SocialFeedSkeleton } from './Skeleton';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userImage: string;
    text: string;
    createdAt: string;
    isGold: boolean;
}

interface SocialFeedProps {
    matchId: string;
}

import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SocialFeed({ matchId }: SocialFeedProps) {
    const { user } = useUser();
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isGold = user?.publicMetadata?.isGold === true || user?.publicMetadata?.role === 'admin';
    const isAdmin = user?.publicMetadata?.role === 'admin';

    const { data: comments = [], isFetching: fetching } = useQuery({
        queryKey: ['comments', matchId],
        queryFn: async () => {
            const res = await fetch(`/api/comments/${matchId}`);
            const data = await res.json();
            return data.comments || [];
        },
        refetchInterval: 15000, // Faster sync for social feed
    });

    // Detect new comments for the "scroll to new" notification
    useEffect(() => {
        if (comments.length > 0 && !fetching) {
            // Si el ID del más reciente cambia, mostramos el aviso (opcional)
            // setHasNew(true); // Esto requiere lógica de comparación con el estado anterior si se quiere ser preciso
        }
    }, [comments]);

    const queryClient = useQueryClient();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || loading || !user) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/comments/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['comments', matchId] });
                setNewComment('');
                setHasNew(false);
                // Scroll to top
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Error sending comment:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("¿Seguro que quieres borrar este comentario?")) return;
        try {
            const res = await fetch(`/api/comments/${matchId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId })
            });
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['comments', matchId] });
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    const handleReport = async (commentId: string) => {
        const reason = window.prompt("¿Por qué quieres reportar este comentario? (Spam, Insultos, etc.)");
        if (!reason) return;
        try {
            const res = await fetch(`/api/comments/${matchId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, reason })
            });
            if (res.ok) {
                alert("Gracias. El reporte ha sido enviado a moderación.");
            }
        } catch (err) {
            console.error("Error reporting comment:", err);
        }
    };

    return (
        <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-8 space-y-8 flex flex-col h-[600px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            {/* New Comments Indicator */}
            <AnimatePresence>
                {hasNew && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => {
                            setHasNew(false);
                            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ArrowDown className="w-3 h-3" />
                        Nuevos comentarios
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase italic tracking-tighter text-white">Social Feed</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-0.5">Comunidad PickGenius</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                </div>
            </div>

            {/* Comments Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 relative z-10"
                onScroll={() => {
                    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
                        setHasNew(false);
                    }
                }}
            >
                {fetching ? (
                    <SocialFeedSkeleton />
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-10">
                        <MessageSquare className="w-12 h-12 mb-4 text-gray-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Sé el primero en comentar este partido</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment: Comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 group/comment"
                            >
                                <div className="shrink-0 relative">
                                    <Image
                                        src={comment.userImage}
                                        alt={comment.userName}
                                        width={40}
                                        height={40}
                                        className="rounded-xl border border-white/10"
                                    />
                                    {comment.isGold && (
                                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-black shadow-glow-sm">
                                            <Crown className="w-2.5 h-2.5 text-black" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "text-xs font-black italic tracking-tight",
                                                comment.isGold ? "text-amber-400" : "text-white"
                                            )}>
                                                @{comment.userName.replace(/\s+/g, '').toLowerCase()}
                                            </span>
                                            {comment.isGold && (
                                                <span className="text-[7px] font-black text-amber-500/50 uppercase px-1.5 py-0.5 bg-amber-500/5 rounded-md border border-amber-500/10">GOLD</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-mono text-gray-700">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <div className="flex items-center gap-2">
                                                {user && comment.userId !== user.id && (
                                                    <button onClick={() => handleReport(comment.id)} className="text-gray-700 hover:text-amber-500 transition-colors" title="Reportar">
                                                        <Flag className="w-3 h-3" />
                                                    </button>
                                                )}
                                                {(isAdmin || comment.userId === user?.id) && (
                                                    <button onClick={() => handleDelete(comment.id)} className="text-gray-700 hover:text-red-500 transition-colors" title="Borrar">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {comment.text.includes("🔥 He optimizado") ? (
                                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-none group-hover/comment:border-primary/40 transition-all space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase flex items-center gap-2">
                                                <Zap className="w-3 h-3" />
                                                Parley Optimizado
                                            </p>
                                            <p className="text-[11px] font-medium text-gray-200 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none group-hover/comment:border-blue-500/20 transition-all">
                                            <p className="text-xs font-medium text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t border-white/5 relative z-10">
                {!user ? (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Inicia sesión para participar en el debate</p>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="relative group/form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={isGold ? "Escribe tu análisis de experto..." : "Únete a la conversación..."}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-5 pr-16 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all resize-none h-14 min-h-[56px] custom-scrollbar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-glow-sm"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
