'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift } from 'lucide-react';

export default function WelcomeToast() {
    const { user } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        if (user && user.displayName) {
            // Verificar si es usuario nuevo (cuenta creada recientemente)
            const currentTime = new Date().getTime();
            const accountTime = new Date(user.createdAt).getTime();
            const isNew = (currentTime - accountTime) < 60000;

            const timer = setTimeout(() => {
                setIsNewUser(isNew);
                setShowToast(true);
            }, 100);

            // Auto-cerrar después de 5-7 segundos
            const closeTimer = setTimeout(() => {
                setShowToast(false);
            }, isNew ? 7000 : 5000);

            return () => {
                clearTimeout(timer);
                clearTimeout(closeTimer);
            };
        }
    }, [user]);

    if (!showToast || !user) return null;

    return (
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
                >
                    <div className="glass-card border border-white/10 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        {/* Close button */}
                        <button
                            onClick={() => setShowToast(false)}
                            className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="p-2 bg-white/10 rounded-xl shrink-0">
                                {isNewUser ? (
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                ) : (
                                    <Gift className="w-6 h-6 text-emerald-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <h3 className="font-black text-lg mb-1">
                                    {isNewUser ? (
                                        <>
                                            ¡Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user.displayName}</span>! 🎉
                                        </>
                                    ) : (
                                        <>
                                            ¡Hola de nuevo, <span className="text-emerald-400">{user.displayName}</span>! 👋
                                        </>
                                    )}
                                </h3>

                                {isNewUser && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-white/70 font-bold">
                                            Tu cuenta ha sido creada exitosamente
                                        </p>
                                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                            <Gift className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-black text-emerald-400">
                                                Tienes 15 días de Premium GRATIS
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!isNewUser && (
                                    <p className="text-xs text-white/60 font-semibold">
                                        {user.isPremium ? '✨ Cuenta Premium activa' : '🎯 Listo para analizar'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: isNewUser ? 6 : 4, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-b-3xl"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
