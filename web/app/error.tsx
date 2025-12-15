'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="text-center glass-card max-w-lg p-8 rounded-2xl border border-gray-800">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Algo salió mal</h2>
                <p className="text-gray-400 mb-8">
                    Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700"
                    >
                        Intentar de nuevo
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    );
}
