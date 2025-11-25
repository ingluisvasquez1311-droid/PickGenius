'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
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

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0b0b0b] p-4">
            <div className="glass-card p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-2 text-center">
                    Únete a <span className="text-[var(--primary)]">PickGenius</span>
                </h1>
                <p className="text-[var(--text-muted)] text-center mb-8">
                    Crea tu cuenta y empieza a ganar
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-[var(--danger)] bg-opacity-10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-[var(--text-muted)]">¿Ya tienes cuenta? </span>
                    <Link href="/auth/login" className="text-[var(--primary)] hover:underline font-medium">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </main>
    );
}
