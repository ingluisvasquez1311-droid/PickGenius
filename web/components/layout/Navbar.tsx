'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        { href: '/streaks', label: 'Rachas', shortLabel: 'Rachas', icon: '🔥', color: 'bg-orange-600', textColor: 'text-orange-400' },
        { href: '/props', label: 'Props', shortLabel: 'Props', icon: '🎯', color: 'bg-purple-600', textColor: 'text-purple-400' },
    ];

    const otrosDeportes = [
        { href: '/american-football', label: 'Fútbol Americano (NFL)', icon: '🏈' },
        { href: '/baseball', label: 'Béisbol (MLB)', icon: '⚾' },
        { href: '/nhl', label: 'Hockey (NHL)', icon: '🏒' },
        { href: '/tennis', label: 'Tenis (ATP)', icon: '🎾' },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav
                className={`fixed left-0 right-0 z-50 transition-all duration-700 ease-in-out transform ${isVisible ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-8 relative overflow-hidden group">
                        {/* Inner highlight border */}
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
                            <div className="hidden lg:flex items-center gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2
                                            ${isActive(link.href)
                                                ? `${link.textColor} bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]`
                                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span>{link.icon}</span>
                                        <span>{link.label}</span>
                                        {isActive(link.href) && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className={`absolute inset-0 border border-white/20 rounded-full z-[-1] ${link.color}/5`}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                ))}

                                {/* Otros Deportes Dropdown */}
                                <div className="relative group/dropdown px-5 py-2.5 text-gray-500 hover:text-white cursor-pointer transition-all flex items-center gap-2">
                                    <span className="text-sm">➕</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Otros</span>
                                    <div className="absolute top-full left-0 mt-4 w-56 bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 p-3 z-50">
                                        {otrosDeportes.map((sub) => (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest group/item"
                                            >
                                                <span className="text-lg group-hover/item:scale-125 transition-transform">{sub.icon}</span>
                                                <span className="group-hover/item:translate-x-1 transition-transform">{sub.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Auth & Mobile Mini */}
                            <div className="flex items-center gap-4">
                                {!loading && (
                                    user ? (
                                        <div className="flex items-center gap-4">
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="text-[9px] font-black tracking-widest border border-red-500/50 bg-red-500/10 px-3 py-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                    ADMIN
                                                </Link>
                                            )}
                                            <NotificationCenter />
                                            <Link href="/profile" className="relative group">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-2 border-white/10 group-hover:border-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                                    <span className="text-sm">👤</span>
                                                </div>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Link href="/auth/register" className="relative overflow-hidden px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
                                                UNIRSE
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
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
                <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="grid grid-cols-6 gap-1 px-2 py-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center gap-1 py-2 px-1"
                            >
                                <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive(link.href)
                                        ? 'scale-110'
                                        : 'scale-100 opacity-60'
                                    }`}>
                                    <span className="text-2xl">{link.icon}</span>
                                    {isActive(link.href) && (
                                        <motion.div
                                            layoutId="mobile-nav-active"
                                            className="absolute -inset-2 border-2 border-white/30 rounded-2xl z-[-1] bg-white/5"
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tight transition-colors ${isActive(link.href)
                                        ? link.textColor
                                        : 'text-gray-500'
                                    }`}>
                                    {link.shortLabel}
                                </span>
                            </Link>
                        ))}

                        {/* Otros Deportes Button */}
                        <button
                            onClick={() => setShowOtrosModal(true)}
                            className="flex flex-col items-center justify-center gap-1 py-2 px-1"
                        >
                            <div className="relative flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                                <span className="text-2xl">➕</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tight text-gray-500">
                                Otros
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile "Otros Deportes" Modal */}
            <AnimatePresence>
                {showOtrosModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOtrosModal(false)}
                            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className="lg:hidden fixed bottom-24 left-4 right-4 z-[70] bg-[#0c0c0c]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6"
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
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
