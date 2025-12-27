import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
    try {
        const { type, target } = await req.json();

        if (!type || !target) {
            return NextResponse.json({ success: false, error: 'Faltan parámetros' }, { status: 400 });
        }

        const payload = {
            title: '🔔 Prueba de Notificación',
            message: 'Esta es una notificación de prueba desde PickGenius Pro. Tu configuración es correcta.',
            sport: 'football',
            gameId: 'test-event',
            confidence: 95
        };

        let result = false;
        if (type === 'telegram') {
            result = await notificationService.sendTelegramMessage(target, payload);
        } else if (type === 'discord') {
            result = await notificationService.sendDiscordMessage(target, payload);
        }

        if (result) {
            return NextResponse.json({ success: true, message: `Prueba de ${type} enviada` });
        } else {
            return NextResponse.json({ success: false, error: `Error enviando prueba a ${type}. Verifica el ID y el Token del Bot en el servidor.` }, { status: 500 });
        }
    } catch (error) {
        console.error('Test Notification Error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}