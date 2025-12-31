"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Trophy, Users, User, ArrowRight, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Image from 'next/image';
import { getTeamImage, getPlayerImage, getTournamentImage, getBlurDataURL } from '@/lib/image-utils';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Keyboard shortcut Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Keyboard navigation for results
    useEffect(() => {
        const handleNavigation = (e: KeyboardEvent) => {
            if (!isOpen || !results || results.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < Math.min(results.length, 8) - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : Math.min(results.length, 8) - 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = results[selectedIndex];
                if (item) handleNavigate(item.type, item.id, item.sport);
            }
        };
        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, results, selectedIndex]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setResults(data.results || []);
                    setSelectedIndex(0);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (type: string, id: number, sport?: any) => {
        setIsOpen(false);
        const sportSlug = sport?.slug || 'football';

        if (type === 'player') {
            router.push(`/player/${sportSlug}/${id}`);
        } else {
            // For teams and tournaments, we navigate to the relevant sport hub
            // as we don't have dedicated team/tournament pages yet.
            router.push(`/${sportSlug}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 sm:px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsOpen(false)}></div>

            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border-4 border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input Bar */}
                <div className="flex items-center gap-4 p-8 border-b-2 border-white/5 bg-white/5">
                    <Search className="w-8 h-8 text-primary" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="BUSCAR EQUIPOS, JUGADORES O LIGAS..."
                        className="flex-1 bg-transparent border-none outline-none text-2xl font-black italic uppercase tracking-tighter text-white placeholder:text-gray-700"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                        <Command className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-black text-gray-500">K</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Results Section */}
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-8 custom-scrollbar">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                                <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">Sincronizando Mapeo Global...</p>
                        </div>
                    )}

                    {!loading && !results && query.length < 2 && (
                        <div className="py-24 text-center space-y-6">
                            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-white/5">
                                <Search className="w-8 h-8 text-gray-700" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Entrada de comandos requerida</p>
                        </div>
                    )}

                    {!loading && results && results.length === 0 && (
                        <div className="py-24 text-center space-y-6">
                            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20">
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500">Sin datos en el cuadrante</h3>
                        </div>
                    )}

                    {results && results.length > 0 && (
                        <div className="grid gap-3 p-2">
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-4 mb-2">Resultados Detectados ({results.length})</p>
                            {results.slice(0, 8).map((item: any, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => handleNavigate(item.type, item.id, item.sport)}
                                    className={clsx(
                                        "flex items-center gap-5 p-5 rounded-[2rem] border-2 border-transparent hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group",
                                        selectedIndex === idx && "border-primary/40 bg-primary/5"
                                    )}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border-2 border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
                                        {item.type === 'player' ? (
                                            <Image
                                                src={getPlayerImage(item.id)}
                                                width={56} height={56}
                                                alt=""
                                                className="object-cover group-hover:scale-110 transition-transform"
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        ) : item.type === 'team' ? (
                                            <Image
                                                src={getTeamImage(item.id)}
                                                width={56} height={56}
                                                alt=""
                                                className="object-contain p-2 group-hover:scale-110 transition-transform"
                                                placeholder="blur"
                                                blurDataURL={getBlurDataURL()}
                                            />
                                        ) : (
                                            <div className="p-3">
                                                <Trophy className="w-full h-full text-gray-600 group-hover:text-primary transition-colors" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black italic uppercase tracking-tighter text-white truncate group-hover:text-primary transition-colors">
                                                {item.name}
                                            </span>
                                            <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full text-gray-600 uppercase tracking-widest group-hover:text-primary/50 border border-transparent group-hover:border-primary/10">
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate mt-1">
                                            {item.sport?.name} {item.category?.name ? `• ${item.category.name}` : ''}
                                        </p>
                                    </div>

                                    <ArrowRight className="w-6 h-6 text-gray-800 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="p-8 bg-white/[0.03] border-t-2 border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <kbd className="px-3 py-1.5 bg-black/60 rounded-xl border-2 border-white/10 text-[10px] font-mono text-gray-500 shadow-inner">↑↓</kbd>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Mover</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <kbd className="px-3 py-1.5 bg-black/60 rounded-xl border-2 border-white/10 text-[10px] font-mono text-gray-500 shadow-inner">Enter</kbd>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Acceso</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">PickGenius Pro Search v4.2</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
