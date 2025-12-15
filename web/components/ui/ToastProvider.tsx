'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            theme="dark"
            richColors
            closeButton
            style={{
                fontFamily: 'var(--font-outfit), sans-serif',
            }}
            toastOptions={{
                style: {
                    background: 'rgba(20, 20, 20, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                },
                className: 'glass-card',
            }}
        />
    );
}
