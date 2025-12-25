'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { requestNotificationPermission, onMessageListener } from '@/lib/services/notificationService';
import { toast } from 'sonner';

export default function NotificationManager() {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'default';
    });
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Listen for foreground messages
        onMessageListener()
            .then((payload: any) => {
                if (payload) {
                    toast(payload.notification?.title || 'Notificación', {
                        description: payload.notification?.body,
                        icon: <BellRing className="w-5 h-5 text-purple-500" />,
                        duration: 5000,
                    });
                }
            })
            .catch(err => console.log('Error listening:', err));

    }, []);

    const handleSubscribe = async () => {
        if (!user) {
            toast.error('Inicia sesión para activar notificaciones');
            return;
        }

        const toastId = toast.loading('Activando notificaciones...');

        const result = await requestNotificationPermission(user.uid);

        setPermission(result.permission);

        if (result.permission === 'granted' && result.token) {
            setIsSubscribed(true);
            toast.success('¡Notificaciones activadas!', { id: toastId });
        } else if (result.permission === 'denied') {
            toast.error('Permiso denegado. Habilítalo en tu navegador.', { id: toastId });
        } else {
            toast.dismiss(toastId);
        }
    };

    if (permission === 'granted') {
        return null; // O mostrar icono activo si quieres que sea visible siempre
    }

    return (
        <button
            onClick={handleSubscribe}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold transition-all border border-purple-500/30"
        >
            <Bell className="w-3.5 h-3.5" />
            <span>Activar Alertas</span>
        </button>
    );
}
