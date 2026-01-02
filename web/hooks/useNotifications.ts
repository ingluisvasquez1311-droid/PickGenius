"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
    id: string | number;
    title: string;
    body: string;
    time: string;
    type: 'value' | 'goal' | 'win' | 'info';
    read: boolean;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);

    const loadNotifications = useCallback(() => {
        const saved = localStorage.getItem('pg_notifications');
        if (saved) {
            const parsed = JSON.parse(saved);
            setNotifications(parsed);
            setHasUnread(parsed.some((n: Notification) => !n.read));
        }
    }, []);

    useEffect(() => {
        loadNotifications();

        // Listen for storage changes from other tabs
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'pg_notifications') {
                loadNotifications();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadNotifications]);

    const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Date.now(),
            time: 'Recién',
            read: false
        };

        const updated = [newNotif, ...notifications];
        setNotifications(updated);
        setHasUnread(true);
        localStorage.setItem('pg_notifications', JSON.stringify(updated.slice(0, 50)));

        // Request browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.body });
        }
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setHasUnread(false);
        localStorage.setItem('pg_notifications', JSON.stringify(updated));
    };

    return {
        notifications,
        hasUnread,
        addNotification,
        markAllAsRead,
        refresh: loadNotifications
    };
};
