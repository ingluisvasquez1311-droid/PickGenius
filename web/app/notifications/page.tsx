"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell, Check, Trash2, Filter, ChevronLeft,
    Trophy, AlertTriangle, Info, Zap
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'win' | 'alert'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage
        const loadNotifications = () => {
            const saved = localStorage.getItem('pg_notifications');
            if (saved) {
                setNotifications(JSON.parse(saved));
            } else {
                // Initial Fallback Data if empty
                const initial = [
                    { id: 1, title: 'GOOOL - Real Madrid', body: 'Vinicius Jr (88\') adelanta a los blancos.', time: 'Hace 2m', type: 'goal', read: false },
                    { id: 2, title: 'Value Bet Detectada', body: 'New York Knicks vs Celtics: Over 220.5', time: 'Hace 15m', type: 'value', read: false },
                    { id: 3, title: 'Final del Partido', body: 'Lakers 112 - 105 Suns. Tu predicción fue CORRECTA.', time: 'Hace 1h', type: 'win', read: false },
                    { id: 4, title: 'Bienvenido a PickGenius Pro', body: 'Tu cuenta ha sido activada correctamente.', time: 'Hace 1d', type: 'system', read: true },
                ];
                setNotifications(initial);
                localStorage.setItem('pg_notifications', JSON.stringify(initial));
            }
            setLoading(false);
        };

        loadNotifications();

        // Listen for storage events to sync with Navbar in real-time (across tabs)
        window.addEventListener('storage', loadNotifications);
        return () => window.removeEventListener('storage', loadNotifications);
    }, []);

    const updateStorage = (newNotifs: any[]) => {
        setNotifications(newNotifs);
        localStorage.setItem('pg_notifications', JSON.stringify(newNotifs));
        // Force Navbar update if in same window (custom event could work, but storage event is for cross-tab)
        window.dispatchEvent(new Event('storage'));
    };

    const markAsRead = (id: number) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        updateStorage(updated);
    };

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        updateStorage(updated);
    };

    const deleteNotification = (id: number) => {
        const updated = notifications.filter(n => n.id !== id);
        updateStorage(updated);
    };

    const clearAll = () => {
        if (confirm('¿Estás seguro de borrar todo el historial?')) {
            updateStorage([]);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        if (filter === 'win') return n.type === 'win' || n.type === 'goal';
        if (filter === 'alert') return n.type === 'value' || n.type === 'system';
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'win': return <Trophy className="w-5 h-5 text-green-500" />;
            case 'goal': return <Zap className="w-5 h-5 text-yellow-400" />;
            case 'value': return <AlertTriangle className="w-5 h-5 text-primary" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-20 pt-32 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-2 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Volver al Inicio</span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                            Centro de <span className="text-primary">Alertas</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
                            Historial de actividad y notificaciones inteligentes
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllRead}
                            disabled={!notifications.some(n => !n.read)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Marcar Leídas
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={notifications.length === 0}
                            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest text-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Borrar Todo
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'unread', label: 'No Leídas' },
                        { id: 'win', label: 'Victorias' },
                        { id: 'alert', label: 'Sistema' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={clsx(
                                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                filter === f.id ? "bg-primary text-black border-primary" : "bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="p-10 text-center space-y-4">
                            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Cargando alertas...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={clsx(
                                    "relative p-6 rounded-[2rem] border transition-all duration-300 group cursor-pointer overflow-hidden",
                                    !notif.read ? "bg-white/[0.07] border-primary/30" : "bg-black/40 border-white/5 hover:border-white/10"
                                )}
                            >
                                {!notif.read && (
                                    <div className="absolute top-0 right-0 p-12 bg-primary/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                )}

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "p-3 rounded-2xl flex items-center justify-center border",
                                            !notif.read ? "bg-black/50 border-white/10" : "bg-white/5 border-white/5"
                                        )}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={clsx("text-sm font-black uppercase italic", !notif.read ? "text-white" : "text-gray-400")}>{notif.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{notif.body}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">{notif.time}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                                <Bell className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-500 uppercase italic">Todo limpio</h3>
                            <p className="text-[10px] uppercase tracking-widest text-gray-700 mt-2">No tienes notificaciones en esta categoría</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
