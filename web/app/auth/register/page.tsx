'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import { UserPlus, LogIn, AlertCircle, Mail, Lock, ShieldCheck, Globe } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err: any) {
            console.error('Google Sign In Error:', err);
            setError('Error al registrarse con Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white selection:bg-purple-500/30 p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-10">
                        <div className="inline-block p-3 bg-white/5 rounded-2xl border border-white/10 mb-6 backdrop-blur-xl">
                            <UserPlus className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2">
                            UNIRSE A <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">PickGenius</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            Crea tu cuenta y domina el juego
                        </p>
                    </div>

                    <GlassCard className="p-8" hover={false}>
                        <div className="space-y-4 mb-8">
                            <PremiumButton
                                onClick={handleGoogleSignIn}
                                type="button"
                                variant="secondary"
                                className="w-full py-3.5 text-xs border-white/5 bg-white/5 hover:bg-white/10"
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Registrarse con Google
                            </PremiumButton>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/5"></div>
                                <span className="flex-shrink mx-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">O crear con email</span>
                                <div className="flex-grow border-t border-white/5"></div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    Email de Registro
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 px-4 py-3.5 rounded-xl text-xs font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="tu@pickgenius.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 px-4 py-3.5 rounded-xl text-xs font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3" />
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 px-4 py-3.5 rounded-xl text-xs font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <PremiumButton
                                loading={loading}
                                className="w-full py-4 text-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Crear Cuenta Gratis
                            </PremiumButton>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                    ¿Ya eres parte del equipo?
                                </p>
                                <Link href="/auth/login" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest group">
                                    <LogIn className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                    Inicia Sesión Aquí
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-700">
                                <Globe className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Acceso Seguro Global</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    );
}
