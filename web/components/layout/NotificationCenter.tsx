'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Bell, CheckCircle2, AlertTriangle, Info, BellOff } from 'lucide-react';

const NotificationCenter = () => {
    const { notifications, unreadCount, markRead, markAllRead } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // DEBUG NOTIFICATIONS
    useEffect(() => {
        if (isOpen) {
            console.log('🔔 [NotificationCenter] DETALLE DE NOTIFICACIONES:');
            console.log(' - No leídas (badge):', unreadCount);
            console.log(' - Total cargadas:', notifications.length);
            console.log(' - Datos:', notifications);
        }
    }, [isOpen, notifications, unreadCount]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400 bg-green-400/10';
            case 'warning': return 'text-yellow-400 bg-yellow-400/10';
            case 'error': return 'text-red-400 bg-red-400/10';
            default: return 'text-blue-400 bg-blue-400/10';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'error': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 group mobile-haptic border ${isOpen
                        ? 'bg-white/20 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/30 shadow-lg'
                    }`}
                title="Notificaciones"
            >
                <Bell
                    className={`w-5 h-5 transition-all duration-300 ${unreadCount > 0
                            ? 'text-yellow-400 fill-yellow-400/40 animate-bounce'
                            : 'text-white'
                        } ${isOpen ? 'scale-110' : 'scale-100'}`}
                />

                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse z-10">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed md:absolute right-2 md:right-0 mt-2 md:mt-4 w-[calc(100vw-1rem)] max-w-sm md:w-96 glass-card border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-300 backdrop-blur-3xl bg-[#0a0a0a]/90">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-black text-xs uppercase tracking-widest text-white/60">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead()}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest mobile-haptic"
                            >
                                Marcar leído
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-white/20 select-none">
                                <div className="text-4xl mb-4 grayscale opacity-50">📭</div>
                                <p className="text-xs font-bold uppercase tracking-widest">Sin novedades</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.read && markRead(notif.id)}
                                        className={`p-4 transition-colors cursor-pointer relative group mobile-haptic ${notif.read ? 'opacity-60 hover:opacity-100' : 'bg-white/[0.03] hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        )}
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTypeStyles(notif.type)} border border-white/5`}>
                                                {getTypeIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-black text-sm text-white truncate pr-2 uppercase tracking-tighter">
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[9px] text-white/30 font-bold shrink-0 whitespace-nowrap mt-1">
                                                        {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-2 font-medium">
                                                    {notif.message}
                                                </p>
                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        className="inline-flex items-center gap-1 text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        VER DETALLE →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] mobile-haptic"
                        >
                            Historial Completo
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
