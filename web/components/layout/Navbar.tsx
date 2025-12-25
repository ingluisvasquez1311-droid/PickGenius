'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationManager from '@/components/notifications/NotificationManager';
import NotificationCenter from './NotificationCenter';


export default function Navbar() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showOtrosModal, setShowOtrosModal] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const navLinks = [
        { href: '/basketball-live', label: 'Baloncesto', shortLabel: 'Basket', icon: '🏀', color: 'bg-orange-600', textColor: 'text-orange-400' },
        { href: '/football-live', label: 'Fútbol', shortLabel: 'Fútbol', icon: '⚽', color: 'bg-green-600', textColor: 'text-green-400' },
        { href: '/value-bets', label: 'Value Bets', shortLabel: 'Value', icon: '💎', color: 'bg-emerald-600', textColor: 'text-emerald-400' },
        { href: '/parley', label: 'Smart Parley', shortLabel: 'Parley', icon: '🎯', color: 'bg-purple-600', textColor: 'text-purple-400' },
        { href: '/streaks', label: 'Rachas', shortLabel: 'Rachas', icon: '🔥', color: 'bg-orange-600', textColor: 'text-orange-400' },
    ];

    const otrosDeportes = [
        { href: '/bankroll', label: 'Bankroll Terminal', icon: '💰' },
        { href: '/props', label: 'Props Predictor', icon: '🎯' },
        { href: '/american-football', label: 'Fútbol Americano (NFL)', icon: '🏈' },
        { href: '/baseball', label: 'Béisbol (MLB)', icon: '⚾' },
        { href: '/nhl', label: 'Hockey (NHL)', icon: '🏒' },
        { href: '/tennis', label: 'Tenis (ATP)', icon: '🎾' },
    ];

    return (
        <>
            {/* Mobile Top Bar - App Style */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 pt-safe bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/50">
                <div className="flex justify-between items-center h-16 px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={28}
                            height={28}
                            className="rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        />
                        <span className="text-sm font-black italic tracking-tighter uppercase text-white">
                            PICK<span className="text-purple-500">GENIUS</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <NotificationCenter />
                        {user && (
                            <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-[1.5px] shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                                    {user.photoURL ? (
                                        <Image src={user.photoURL} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-black text-white">{user.email?.[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <nav
                className={`fixed left-0 right-0 z-50 transition-all duration-700 ease-in-out transform hidden lg:block ${isVisible ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-8 relative group">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        <div className="flex justify-between items-center h-20">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                                <Image
                                    src="/logo.png"
                                    alt="PickGenius Logo"
                                    width={36}
                                    height={36}
                                    className="rounded-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                    priority
                                />
                                <span className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-purple-400 transition-colors">
                                    PICK<span className="text-purple-500">GENIUS</span>
                                </span>
                            </Link>

                            {/* Navigation Links - Desktop Only */}
                            <div className="flex items-center gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2
                                                ${isActive(link.href)
                                                ? `${link.textColor} bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]`
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-base">{link.icon}</span>
                                        <span className="hidden xl:block">{link.label}</span>
                                        {isActive(link.href) && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className={`absolute inset-0 border border-white/20 rounded-full z-[-1] ${link.color}/5`}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                ))}

                                {/* Desktop "Más" Toggle */}
                                <button
                                    onClick={() => setShowOtrosModal(true)}
                                    className="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border border-white/5"
                                >
                                    <span>➕</span>
                                    <span>Más</span>
                                </button>
                            </div>

                            {/* Auth & Mobile Mini */}
                            <div className="flex items-center gap-4">
                                {!loading && (
                                    user ? (
                                        <div className="flex items-center gap-4">
                                            {user.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="hidden md:flex items-center gap-2 text-[10px] font-black tracking-[0.2em] border-2 border-red-500 bg-red-500/10 px-5 py-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
                                                >
                                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                    ADMIN PANEL
                                                </Link>
                                            )}

                                            <NotificationManager />
                                            <NotificationCenter />

                                            {/* User Dropdown */}
                                            <div className="relative group/profile">
                                                <Link href="/profile" className="flex items-center">
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-2 border-white/10 group-hover/profile:border-purple-400 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] relative overflow-hidden">
                                                        {user.photoURL ? (
                                                            <Image src={user.photoURL} alt="Avatar" width={44} height={44} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-black italic uppercase text-white">
                                                                {user.email?.[0].toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>

                                                {/* Desktop Profile Menu */}
                                                <div className="absolute top-full right-0 mt-4 w-52 bg-[#0c0c0c]/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 p-3 z-50">
                                                    {user.role === 'admin' && (
                                                        <Link href="/admin" className="md:hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest mb-2 border border-red-500/20">
                                                            <span>🛡️</span> Panel Admin
                                                        </Link>
                                                    )}
                                                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                                                        <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                                                            {user.displayName || user.email?.split('@')[0]}
                                                        </p>
                                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest truncate">
                                                            {user.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PREMIUM ANALYST'}
                                                        </p>
                                                    </div>
                                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white">
                                                        <span>👤</span> Mi Perfil
                                                    </Link>
                                                    <Link href="/my-stats" className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white">
                                                        <span>📈</span> Mi Rendimiento
                                                    </Link>
                                                    <Link href="/profile?tab=settings" className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white">
                                                        <span>⚙️</span> Ajustes
                                                    </Link>
                                                    <button
                                                        onClick={() => signOut()}
                                                        className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-red-500/10 transition-all text-xs font-bold text-red-500/70 hover:text-red-500"
                                                    >
                                                        <span>⚡</span> Desconectar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Link href="/auth/register" className="relative overflow-hidden px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_15px_35px_rgba(255,255,255,0.25)]">
                                                UNIRSE AHORA
                                            </Link>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe mobile-haptic">
                <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-t border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.9)] rounded-t-[3rem] overflow-hidden">
                    <div className="grid grid-cols-5 gap-0 px-2 pt-5 pb-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center gap-2 py-1"
                            >
                                <div className={`relative flex items-center justify-center transition-all duration-500 ${isActive(link.href)
                                    ? 'scale-125 -translate-y-1.5'
                                    : 'scale-100 opacity-30 shadow-none'
                                    }`}>
                                    <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{link.icon}</span>
                                    {isActive(link.href) && (
                                        <motion.div
                                            layoutId="mobile-nav-active"
                                            className="absolute -inset-3 bg-white/15 rounded-2xl z-[-1]"
                                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${isActive(link.href)
                                    ? 'text-white'
                                    : 'text-gray-700'
                                    }`}>
                                    {link.shortLabel}
                                </span>
                            </Link>
                        ))}

                        {/* Mobile "Más" Button */}
                        <button
                            onClick={() => setShowOtrosModal(true)}
                            className="flex flex-col items-center justify-center gap-2 py-1"
                        >
                            <div className="relative flex items-center justify-center scale-100 opacity-30">
                                <span className="text-2xl">➕</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-700">
                                Más
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile "Otros Deportes" Modal */}
            <AnimatePresence>
                {showOtrosModal && (
                    <div className="contents">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOtrosModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className="fixed inset-x-4 bottom-24 lg:bottom-auto lg:top-24 lg:left-auto lg:right-24 lg:w-96 z-[70] bg-[#0c0c0c]/98 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                                    Otros Deportes
                                </h3>
                                <button
                                    onClick={() => setShowOtrosModal(false)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <span className="text-white text-xl">×</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {otrosDeportes.map((deporte) => (
                                    <Link
                                        key={deporte.href}
                                        href={deporte.href}
                                        onClick={() => setShowOtrosModal(false)}
                                        className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                                    >
                                        <span className="text-4xl group-hover:scale-110 transition-transform">
                                            {deporte.icon}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-wide text-center text-gray-300 group-hover:text-white transition-colors">
                                            {deporte.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
