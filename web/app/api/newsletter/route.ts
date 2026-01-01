import { NextRequest, NextResponse } from 'next/server';
import RedisManager from '@/lib/redis';
import { z } from 'zod';

const subscriberSchema = z.object({
    email: z.string().email("Formato de email inválido"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = subscriberSchema.parse(body);

        const redis = RedisManager.getInstance();
        const key = 'marketing:subscribers';

        // 1. Redis (Validación rápida y caché)
        await redis.sadd(key, email);

        // 2. Firebase (Persistencia de Leads)
        try {
            const { db } = await import('@/lib/firebase-admin');
            if (db) {
                await db.collection('newsletter_subscribers').doc(email).set({
                    email,
                    subscribedAt: new Date(),
                    status: 'active'
                }, { merge: true });
            }
        } catch (dbError) {
            console.error('[Firebase Newsletter Error]:', dbError);
        }

        return NextResponse.json({
            success: true,
            message: "¡Bienvenido a la élite! Te has suscrito correctamente."
        });
    } catch (error: any) {
        let message = "Error al procesar la suscripción";
        if (error instanceof z.ZodError) {
            message = error.issues[0].message;
        }
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
}
