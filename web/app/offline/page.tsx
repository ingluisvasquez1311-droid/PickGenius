'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    const [online, setOnline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        // Verificar estado inicial
        setOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#1a0b2e] to-[#0b0b0b] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative bg-gradient-to-br from-primary/20 to-purple-600/20 p-8 rounded-full border border-primary/30">
                            <WifiOff className="w-16 h-16 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Sin Conexión
                </h1>

                {/* Description */}
                <p className="text-gray-400 mb-8 text-lg">
                    {online
                        ? '✅ Conexión restaurada. Toca el botón para continuar.'
                        : 'Verifica tu conexión a internet e intenta nuevamente.'
                    }
                </p>

                {/* Status Badge */}
                <div className="mb-8 flex justify-center gap-3">
                    <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            ${online
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }
          `}>
                        <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                        {online ? 'En línea' : 'Sin conexión'}
                    </div>
                </div>

                {/* Retry Button */}
                <button
                    onClick={handleRetry}
                    disabled={!online}
                    className="
            group relative w-full py-4 px-6 rounded-xl font-semibold text-white
            bg-gradient-to-r from-primary to-purple-600
            hover:from-primary/90 hover:to-purple-600/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
            shadow-lg shadow-primary/25
            hover:shadow-xl hover:shadow-primary/40
            disabled:shadow-none
          "
                >
                    <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        {online ? 'Reintentar Ahora' : 'Esperando Conexión...'}
                    </span>
                </button>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400">
                        💡 <span className="font-medium text-gray-300">Tip:</span> Algunos datos pueden estar disponibles en cache
                    </p>
                </div>

                {/* Back Home */}
                <a
                    href="/"
                    className="mt-6 inline-block text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                >
                    ← Volver al inicio
                </a>
            </div>
        </div>
    );
}
