'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="text-center glass-card max-w-lg p-8 rounded-2xl border border-gray-800">
                <h1 className="text-6xl font-bold text-gray-800 mb-4 opacity-50">404</h1>
                <h2 className="text-2xl font-bold text-white mb-4">Página no encontrada</h2>
                <p className="text-gray-400 mb-8">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <span>🏠</span>
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}
