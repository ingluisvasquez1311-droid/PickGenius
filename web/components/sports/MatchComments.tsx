'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, subscribeToComments, Comment } from '@/lib/services/commentService';
import { Send, User, Crown, Shield, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface MatchCommentsProps {
    matchId: string;
}

export default function MatchComments({ matchId }: MatchCommentsProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToComments(matchId, (updatedComments) => {
            setComments(updatedComments);
            setLoading(false);
            // Scroll to bottom
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });

        return () => unsubscribe();
    }, [matchId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Debes iniciar sesión para comentar');
            return;
        }
        if (!newComment.trim()) return;

        try {
            setSending(true);
            await addComment(
                matchId,
                user.uid,
                user.displayName || user.email.split('@')[0],
                newComment.trim(),
                user.role === 'admin' ? 'admin' : user.isPremium ? 'premium' : 'user',
                user.photoURL
            );
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Error al enviar el comentario');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                    Sala de Análisis en Vivo
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                    {comments.length} Comentarios
                </span>
            </div>

            {/* Comments List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Invocando el chat...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center px-6">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">¡Nadie ha comentado aún!</p>
                        <p className="text-xs opacity-60">Sé el primero en compartir tu veredicto.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                                {comment.photoURL ? (
                                    <img src={comment.photoURL} alt={comment.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-white truncate">
                                        {comment.displayName}
                                    </span>
                                    {comment.role === 'admin' && (
                                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                            <Shield className="w-2.5 h-2.5" /> STAFF
                                        </span>
                                    )}
                                    {comment.role === 'premium' && (
                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                            <Crown className="w-2.5 h-2.5" /> PRO
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-500">
                                        {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true, locale: es }) : 'ahora'}
                                    </span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                    <p className="text-sm text-gray-200 leading-relaxed break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe tu análisis..."
                            className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newComment.trim()}
                            className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 ml-0.5" />
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs text-gray-400">
                            Ingresa para participar en la conversación.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
