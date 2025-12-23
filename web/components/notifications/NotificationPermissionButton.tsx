'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
    getNotificationPermission,
    requestNotificationPermission,
    registerServiceWorker
} from '@/lib/pushNotifications';
import { toast } from 'sonner';

export default function NotificationPermissionButton() {
    const [permission, setPermission] = useState<NotificationPermission>(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'default';
    });
    const [loading, setLoading] = useState(false);

    const handleEnableNotifications = async () => {
        setLoading(true);

        const granted = await requestNotificationPermission();

        if (granted) {
            await registerServiceWorker();
            setPermission('granted');
            toast.success('¡Notificaciones activadas! 🔔', {
                description: 'Recibirás alertas de Hot Picks'
            });
        } else {
            toast.error('Permiso denegado', {
                description: 'Activa las notificaciones en la configuración del navegador'
            });
        }

        setLoading(false);
    };

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <Bell className="w-3 h-3 text-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-green-500">
                    Activas
                </span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                <BellOff className="w-3 h-3 text-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">
                    Bloqueadas
                </span>
            </div>
        );
    }

    return (
        <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-full transition-all disabled:opacity-50"
        >
            <Bell className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                {loading ? 'Activando...' : 'Activar Alertas'}
            </span>
        </button>
    );
}
