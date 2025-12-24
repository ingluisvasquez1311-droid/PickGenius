'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import { LogIn, UserPlus, AlertCircle, Mail, Lock, ShieldCheck, Globe, CheckCircle2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { auth as firebaseAuth } from '@/lib/firebase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fbStatus, setFbStatus] = useState<'checking' | 'ready' | 'error'>('checking');
    const [showDebug, setShowDebug] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Health check para Firebase
        if (firebaseAuth) {
            setFbStatus('ready');
        } else {
            setFbStatus('error');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrorDetails(null);
        setLoading(true);

        try {
            await signIn(email, password);
            router.push('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setErrorDetails(err.code || err.message);
            if (err.code === 'auth/invalid-credential') {
                setError('Credenciales incorrectas o el usuario no existe. Intenta registrarte si eres nuevo.');
            } else {
                setError(err.message || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setErrorDetails(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err: any) {
            console.error('Google Sign In Error:', err);
            setErrorDetails(err.code || err.message);
            if (err.code === 'auth/unauthorized-domain') {
                setError('Dominio no autorizado. Debes añadir "localhost" en la consola de Firebase.');
            } else {
                setError('Error al conectar con Google. Activa el Modo Depuración para ver el código.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Firebase Env Debug Info (Obfuscated)
    const debugInfo = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(0, 5)}...${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(-5)}` : 'MISSING',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
        status: fbStatus
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white selection:bg-purple-500/30 p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-10">
                        <div className="inline-block p-3 bg-white/5 rounded-2xl border border-white/10 mb-6 backdrop-blur-xl group cursor-help relative"
                            onClick={() => setShowDebug(!showDebug)}>
                            <LogIn className="w-8 h-8 text-purple-500" />
                            {/* Firebase Status Badge */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#050505] flex items-center justify-center transition-colors ${fbStatus === 'ready' ? 'bg-emerald-500' : fbStatus === 'error' ? 'bg-red-500' : 'bg-orange-500'
                                }`}>
                                {fbStatus === 'ready' && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2">
                            PICK<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">GENIUS</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            Acceso al Núcleo de Predicciones
                        </p>
                    </div>

                    <GlassCard className="p-8" hover={false}>
                        {/* Technical Debug Panel */}
                        {showDebug && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mb-6 overflow-hidden border-b border-white/5 pb-6"
                            >
                                <div className="bg-black/50 rounded-xl p-4 border border-white/10 font-mono text-[9px] text-gray-400 space-y-2">
                                    <div className="flex items-center gap-2 text-purple-400 font-black mb-2 uppercase">
                                        <Terminal className="w-3 h-3" />
                                        Firebase Diagnostic
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-gray-600 uppercase">ApiKey:</span>
                                        <span className="col-span-2 text-white truncate">{debugInfo.apiKey}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-gray-600 uppercase">Project:</span>
                                        <span className="col-span-2 text-white">{debugInfo.projectId}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-gray-600 uppercase">Domain:</span>
                                        <span className="col-span-2 text-white">{debugInfo.authDomain}</span>
                                    </div>
                                    {errorDetails && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <span className="text-red-400 font-black uppercase block mb-1">Last Error:</span>
                                            <span className="text-red-300 break-all">{errorDetails}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {fbStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                ❌ Error de Configuración de Firebase. Revisa tus variables de entorno.
                            </div>
                        )}

                        <div className="space-y-4 mb-8">
                            <PremiumButton
                                onClick={handleGoogleSignIn}
                                type="button"
                                variant="secondary"
                                className="w-full py-3.5 text-xs border-white/5 bg-white/5 hover:bg-white/10 mobile-haptic"
                                disabled={loading || fbStatus === 'error'}
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuar con Google
                            </PremiumButton>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/5"></div>
                                <span className="flex-shrink mx-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">O entrar con email</span>
                                <div className="flex-grow border-t border-white/5"></div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    Email de Usuario
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 px-4 py-3.5 rounded-xl text-xs font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="ejemplo@pickgenius.com"
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

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <div className="flex flex-col">
                                        <span>{error}</span>
                                        {errorDetails && <span className="opacity-50 text-[8px] mt-1 font-mono uppercase tracking-tighter">Code: {errorDetails}</span>}
                                    </div>
                                </motion.div>
                            )}

                            <PremiumButton
                                loading={loading}
                                className="w-full py-4 text-sm mobile-haptic"
                                disabled={fbStatus === 'error'}
                            >
                                <LogIn className="w-4 h-4" />
                                Iniciar Sesión Profunda
                            </PremiumButton>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                                    ¿Nuevo en el equipo?
                                </p>
                                <Link href="/auth/register" className="inline-flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest group">
                                    <UserPlus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                    Regístrate Gratis Aquí
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-700">
                                <Globe className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Servidores Activos en Tiempo Real</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    );
}
