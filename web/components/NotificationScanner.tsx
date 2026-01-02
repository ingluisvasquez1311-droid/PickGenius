"use client";

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationScanner() {
    const { addNotification } = useNotifications();
    const lastCheckRef = useRef<number>(0);
    const notifiedBetsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Load already notified from session (to avoid spamming in same session)
        const scan = async () => {
            try {
                // Only scan if at least 2 minutes have passed
                if (Date.now() - lastCheckRef.current < 120000) return;
                lastCheckRef.current = Date.now();

                const res = await fetch('/api/value?sport=all');
                const data = await res.json();

                if (data.valueBets && Array.isArray(data.valueBets)) {
                    // Extract top value bets (edge > 12%)
                    const highValueBets = data.valueBets.filter((bet: any) => {
                        const edgeNum = parseInt(bet.edge);
                        const betId = `${bet.match}-${bet.market}-${bet.odds}`;

                        // Rule: Edge > 12% and not already notified in this session
                        if (edgeNum >= 12 && !notifiedBetsRef.current.has(betId)) {
                            notifiedBetsRef.current.add(betId);
                            return true;
                        }
                        return false;
                    });

                    // Add only the first 2 highest to not overwhelm
                    highValueBets.slice(0, 2).forEach((bet: any) => {
                        addNotification({
                            title: '💎 ¡VALUE BET DETECTADA!',
                            body: `${bet.match}: ${bet.market} (@${bet.odds}) - Edge: ${bet.edge}`,
                            type: 'value'
                        });
                    });
                }
            } catch (error) {
                console.error("[NotificationScanner] Error scanning:", error);
            }
        };

        // Initial scan after 10s
        const timer = setTimeout(scan, 10000);

        // Periodic scan every 5m
        const interval = setInterval(scan, 300000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [addNotification]);

    // Request permissions on first mount if not asked
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return null; // Invisible
}
