import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación Premium
const PREMIUM_ROUTES = [
    '/dashboard',
    '/value-bets',
    '/streaks',
];

// Rutas que requieren rol de administrador
const ADMIN_ROUTES = [
    '/admin',
    '/admin/analytics',
    '/admin/users',
    '/admin/content',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar si la ruta requiere Premium
    const isPremiumRoute = PREMIUM_ROUTES.some(route => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

    if (isPremiumRoute || isAdminRoute) {
        // Obtener el token de autenticación de las cookies
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            // Redirigir a login si no hay token
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Aquí normalmente verificarías el token con Firebase Admin
        // Por ahora, permitimos que el cliente verifique en el componente

        // Opcionalmente, puedes agregar headers personalizados
        const response = NextResponse.next();
        response.headers.set('x-requires-auth', 'true');

        if (isAdminRoute) {
            response.headers.set('x-requires-admin', 'true');
        }
        if (isPremiumRoute) {
            response.headers.set('x-requires-premium', 'true');
        }

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/value-bets/:path*',
        '/streaks/:path*',
        '/admin/:path*',
    ],
};
