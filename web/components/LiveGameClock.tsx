"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LiveGameClockProps {
    startTimestamp?: number;
    statusDescription?: string;
    statusType?: string;
    sport?: string;
}

export default function LiveGameClock({ startTimestamp, statusDescription, statusType }: LiveGameClockProps) {
    const [timeDisplay, setTimeDisplay] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            // 1. If not in progress or no timestamp, just show description
            if (statusType !== 'inprogress' || !startTimestamp) {
                setTimeDisplay(statusDescription || '');
                return;
            }

            // 2. Calculate time
            const start = startTimestamp * 1000;
            const now = Date.now();
            const diffMinutes = Math.floor((now - start) / 60000);

            let base = 0;
            const desc = statusDescription || '';

            // Football logic (simplified for now, can be expanded)
            if (desc.includes('2nd') || desc.includes('2T')) base = 45;
            if (desc.includes('3rd') || desc.includes('3T')) base = 0; // Basketball/Others usually reset or cumulative
            if (desc.includes('4th') || desc.includes('4T')) base = 0;

            // For extra time or halftime, we might rely purely on description
            if (desc.toLowerCase().includes('half') || desc.toLowerCase().includes('descanso')) {
                setTimeDisplay('HT');
                return;
            }

            const totalMinutes = base + diffMinutes;
            // Cap at reasonable max (e.g. 45+ or 90+) to avoid showing "145'" if data is stale
            // But let's show calculated time. 
            // If it's negative (data sync issue), show 0
            const finalTime = totalMinutes > 0 ? totalMinutes : 0;

            setTimeDisplay(`${finalTime}'`);
        };

        // Update immediately
        updateTime();

        // Update every 30 seconds to stay relatively synced without over-polling
        const interval = setInterval(updateTime, 30000);

        return () => clearInterval(interval);
    }, [startTimestamp, statusDescription, statusType]);

    if (!timeDisplay) return null;

    return (
        <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
            {timeDisplay}
        </span>
    );
}
