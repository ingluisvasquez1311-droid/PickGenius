'use client';

import React, { useState, useEffect } from 'react';
import ChristmasSnow from '@/components/ui/ChristmasSnow';

export default function ChristmasWrapper() {
    const [mounted, setMounted] = useState(() => typeof window !== 'undefined');

    if (!mounted) return null;

    return (
        <>
            <ChristmasSnow />
            {/* Festive Top Gradient Overlay */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500 opacity-80 z-[100] blur-[2px]" />
        </>
    );
}
