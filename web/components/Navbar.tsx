"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Zap, Radio, Menu, Trophy, X,
    Target, Flame, Newspaper, Plus, Bell,
    User, LayoutDashboard, Globe, Activity, Star,
    Circle, Diamond, Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import ParleyOptimizer from './ParleyOptimizer';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser
} from '@clerk/nextjs';
// Lucide icons merged above

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const pathname = usePathname();
    const { user } = useUser();
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isGold = user?.publicMetadata?.isGold === true || user?.publicMetadata?.role === 'admin' || user?.emailAddresses[0]?.emailAddress === 'luisvasquez1311@gmail.com';

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/checkout/session', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error('Upgrade error:', e);
        } finally {
            setIsUpgrading(false);
        }
    };

    const otherSports = [
        { name: 'TENIS', href: '/tennis', icon: Trophy },
        { name: 'BASEBALL', href: '/baseball', icon: Star },
        { name: 'HOCKEY', href: '/hockey', icon: Zap },
        { name: 'NFL', href: '/nfl', icon: Target },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Load notifications from localStorage
        const saved = localStorage.getItem('pg_notifications');
        if (saved) {
            const parsed = JSON.parse(saved);
            setNotifications(parsed);
            setHasUnread(parsed.some((n: any) => !n.read));
        } else {
            // Initial mock notifications if none saved
            const initial = [
                { id: 1, title: 'GOOOL - Real Madrid', body: 'Vinicius Jr (88\') adelanta a los blancos.', time: 'Hace 2m', type: 'goal', read: false },
                { id: 2, title: 'Value Bet Detectada', body: 'New York Knicks vs Celtics: Over 220.5', time: 'Hace 15m', type: 'value', read: false },
                { id: 3, title: 'Final del Partido', body: 'Lakers 112 - 105 Suns. Tu predicción fue CORRECTA.', time: 'Hace 1h', type: 'win', read: false },
            ];
            setNotifications(initial);
            setHasUnread(true);
            localStorage.setItem('pg_notifications', JSON.stringify(initial));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setHasUnread(false);
        localStorage.setItem('pg_notifications', JSON.stringify(updated));
    };

    const navItems = [
        { name: 'BALONCESTO', href: '/basketball', icon: Activity, color: 'text-[#FF4500]' },
        { name: 'FÚTBOL', href: '/football', icon: Circle, color: 'text-white' },
        { name: 'VALUE BETS', href: '/value', icon: Diamond, color: 'text-cyan-400' },
        { name: 'PLAYER PROPS', href: '/props', icon: User, color: 'text-primary' },
        { name: 'SMART PARLEY', href: '#', icon: Target, isSpecial: true, color: 'text-red-600' },
        { name: 'RACHAS', href: '/streaks', icon: Flame, color: 'text-orange-500' },
        { name: 'MI PERFIL', href: '/profile', icon: User, color: 'text-blue-400', isPrivate: true },
        { name: 'BLOG', href: '/blog', icon: Newspaper, color: 'text-gray-400' },
        { name: '+ MÁS', href: '/more', icon: Plus, color: 'text-gray-500' },
    ];

    return (
        <nav className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4">
            {/* --- PILL CONTAINER --- */}
            <div className={clsx(
                "w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-full border border-white/10 transition-all duration-500",
                isScrolled ? "bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]" : "bg-black/40 backdrop-blur-xl"
            )}>

                {/* Brand / Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative overflow-hidden">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xl font-black tracking-tighter text-white italic">
                            PICK<span className="text-primary">GENIUS</span>
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation Items */}
                <div className="hidden xl:flex items-center gap-1">
                    {navItems.map((item) => (
                        <div key={item.name} className="relative group/item">
                            {item.name === '+ MÁS' ? (
                                <div
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-white cursor-pointer"
                                    onMouseEnter={() => setIsMoreOpen(true)}
                                    onMouseLeave={() => setIsMoreOpen(false)}
                                >
                                    <item.icon className={clsx("w-3.5 h-3.5", item.color)} />
                                    {item.name}

                                    {isMoreOpen && (
                                        <div className="absolute top-full left-0 pt-4 w-48 animate-in fade-in slide-in-from-top-2">
                                            <div className="p-4 bg-black/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                                                <div className="space-y-2">
                                                    <p className="px-2 pb-2 text-[8px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">Explorar Más</p>
                                                    {otherSports.map((s) => (
                                                        <Link
                                                            key={s.href}
                                                            href={s.href}
                                                            className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-primary transition-all"
                                                        >
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                                                            <s.icon className="w-3 h-3" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : item.isSpecial ? (
                                <button
                                    key={item.href}
                                    onClick={() => setIsOptimizerOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 mx-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-white/10 border border-white/10 text-white hover:bg-white/20 relative"
                                >
                                    <item.icon className={clsx("w-3.5 h-3.5", item.color)} />
                                    {item.name}
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                </button>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        pathname === item.href ? "text-white bg-white/5" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <item.icon className={clsx("w-3.5 h-3.5", pathname === item.href ? "text-white" : item.color)} />
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Admin Panel Button */}
                    <Link
                        href="/admin"
                        className="hidden md:flex flex-col items-center justify-center px-6 py-2 border border-red-500/30 rounded-2xl hover:bg-red-500/10 transition-all group"
                    >
                        <span className="text-[7px] font-black text-red-500 uppercase tracking-[0.3em] leading-none mb-1">• ADMIN</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">PANEL</span>
                    </Link>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={clsx(
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative",
                                isNotificationsOpen ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
                            )}>
                            <Bell className="w-4 h-4" />
                            {hasUnread && (
                                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute top-full right-0 mt-4 w-80 p-0 bg-black/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Centro de Alertas</span>
                                    {hasUnread && (
                                        <span
                                            onClick={markAllAsRead}
                                            className="text-[9px] font-bold text-primary cursor-pointer hover:text-white transition-colors"
                                        >
                                            Marcar leídas
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative">
                                                {!notif.read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"></div>
                                                )}
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={clsx("text-xs font-black uppercase", notif.type === 'win' ? "text-green-500" : notif.type === 'value' ? "text-primary" : "text-white")}>{notif.title}</h4>
                                                    <span className="text-[8px] text-gray-600 font-mono">{notif.time}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium group-hover:text-gray-300">{notif.body}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No hay notificaciones</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-white/5 text-center">
                                    <Link href="/notifications" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Ver todo el historial</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile / Auth */}
                    <div className="flex items-center">
                        <SignedOut>
                            <div className="flex items-center gap-3">
                                <SignInButton mode="modal">
                                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                                        Entrar
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="px-5 py-2.5 bg-primary text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-sm">
                                        Unirse
                                    </button>
                                </SignUpButton>
                            </div>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center gap-3 mr-3">
                                {!isGold && (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_-5px_rgba(251,191,36,0.4)] disabled:opacity-50"
                                    >
                                        <Crown className="w-3.5 h-3.5" />
                                        {isUpgrading ? 'Procesando...' : 'Pasar a Gold'}
                                    </button>
                                )}
                                {isGold && (
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                                        <Crown className="w-3 h-3 text-primary" />
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Socio Gold</span>
                                    </div>
                                )}
                            </div>
                            <UserButton afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-10 h-10 rounded-xl border border-white/10 shadow-lg hover:scale-105 transition-transform",
                                        userButtonTrigger: "focus:shadow-none focus:outline-none"
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="xl:hidden p-2 text-white hover:bg-white/5 rounded-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="xl:hidden fixed inset-0 z-[-1] bg-black/95 backdrop-blur-2xl p-10 pt-32 animate-in fade-in slide-in-from-right-10">
                    <div className="space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={clsx("w-6 h-6", item.color)} />
                                    <span className="text-xl font-black uppercase italic italic tracking-tighter">{item.name}</span>
                                </div>
                                <Plus className="w-5 h-5 text-gray-700" />
                            </Link>
                        ))}
                        <Link
                            href="/admin"
                            className="flex items-center justify-center p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-500 font-black uppercase tracking-widest mt-12"
                        >
                            ADMIN PANEL
                        </Link>
                    </div>
                </div>
            )}
            {/* Parley Optimizer Modal */}
            <ParleyOptimizer isOpen={isOptimizerOpen} onClose={() => setIsOptimizerOpen(false)} />
        </nav>
    );
}
