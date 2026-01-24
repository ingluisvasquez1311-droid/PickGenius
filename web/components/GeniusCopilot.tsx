"use client";

import { useState, useRef, useEffect } from 'react';
import {
    MessageSquare, X, Send, Sparkles,
    Bot, User, Minimize2, Maximize2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function GeniusCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Iniciando sistema... Soy Genius Copilot. ¿En qué estadística o estrategia puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newUserMsg: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare context (last 6 messages to save tokens)
            const contextMessages = [...messages.slice(-6), newUserMsg];

            const res = await fetch('/api/copilot/chat', { // Updated endpoint path
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: contextMessages })
            });

            if (!res.ok) throw new Error('Network error');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error de conexión con el núcleo IA. Intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB Trigger */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] border border-white/20 group"
                    >
                        <Bot className="w-7 h-7 text-white animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={clsx(
                            "fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden",
                            isMinimized ? "h-20" : "h-[600px] max-h-[80vh]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black italic uppercase text-white tracking-wider">Genius Copilot</h3>
                                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={clsx(
                                                "flex items-start gap-3 max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1",
                                                msg.role === 'user' ? "bg-white/10" : "bg-primary/20"
                                            )}>
                                                {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-primary" />}
                                            </div>
                                            <div className={clsx(
                                                "p-3 rounded-2xl text-xs font-medium leading-relaxed",
                                                msg.role === 'user'
                                                    ? "bg-white text-black rounded-tr-none"
                                                    : "bg-white/5 border border-white/5 text-gray-200 rounded-tl-none"
                                            )}>
                                                {msg.role === 'assistant' ? (
                                                    <div className="markdown-prose" dangerouslySetInnerHTML={{
                                                        __html: msg.content
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Simple bold
                                                            .replace(/\n/g, '<br/>') // Line breaks
                                                    }} />
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3 mr-auto">
                                            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                                <Bot className="w-3 h-3 text-primary" />
                                            </div>
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/40">
                                    <div className="relative flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Pregunta sobre partidos o stats..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs font-medium text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputValue.trim() || isLoading}
                                            className="absolute right-2 p-1.5 bg-primary text-black rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
