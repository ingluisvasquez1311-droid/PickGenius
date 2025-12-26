'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UsePremiumGuardOptions {
    redirectTo?: string;
    showToast?: boolean;
    checkAdmin?: boolean;
}

/**
 * Hook personalizado para proteger contenido premium
 * Redirige al usuario a /pricing si no es premium
 */
export function usePremiumGuard(options: UsePremiumGuardOptions = {}) {
    const {
        redirectTo = '/pricing',
        showToast = true,
        checkAdmin = false
    } = options;

    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Si no hay usuario, redirigir a login
        if (!user) {
            if (showToast) {
                toast.error('Debes iniciar sesión para acceder a este contenido');
            }
            router.push('/login');
            return;
        }

        // Verificar acceso de administrador si es requerido
        if (checkAdmin) {
            const isAdmin = user.role === 'admin' ||
                user.email?.toLowerCase() === 'pickgenius@gmail.com' ||
                user.email?.toLowerCase() === 'ingluisvasquez1311@gmail.com';

            if (!isAdmin) {
                if (showToast) {
                    toast.error('🔒 Acceso denegado', {
                        description: 'Esta sección es solo para administradores'
                    });
                }
                router.push('/');
                return;
            }
        }

        // Verificar si el usuario es Premium
        const isPremium = user.isPremium || user.role === 'admin';

        if (!isPremium && !checkAdmin) {
            if (showToast) {
                toast.error('🔒 Contenido Premium', {
                    description: 'Actualiza a Premium para acceder a esta funcionalidad',
                    action: {
                        label: 'Ver Planes',
                        onClick: () => router.push('/pricing'),
                    },
                    duration: 6000,
                });
            }
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo, showToast, checkAdmin]);

    return {
        user,
        loading,
        isPremium: user?.isPremium || user?.role === 'admin' || false,
        isAdmin: user?.role === 'admin' || false,
    };
}

/**
 * Componente HOC para proteger páginas completas
 */
export function withPremiumGuard<P extends object>(
    Component: React.ComponentType<P>,
    options?: UsePremiumGuardOptions
) {
    return function ProtectedComponent(props: P) {
        const { loading } = usePremiumGuard(options);

        if (loading) {
            return (
                <div className= "min-h-screen bg-[#0b0b0b] flex items-center justify-center" >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" > </div>
                    </div>
      );
        }

        return <Component { ...props } />;
    };
}
