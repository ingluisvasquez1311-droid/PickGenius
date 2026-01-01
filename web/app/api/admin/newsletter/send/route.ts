import { NextRequest, NextResponse } from 'next/server';
import RedisManager from '@/lib/redis';
import { sendEmail, buildWeeklyPicksTemplate } from '@/lib/email-service';

/**
 * ADMIN ONLY: Triggers the weekly picks newsletter to all subscribers.
 */
export async function POST(req: NextRequest) {
    try {
        // En un entorno real, verificaríamos un token de admin o sesión
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const redis = RedisManager.getInstance();
        const subscribersKey = 'marketing:subscribers';
        const subscribers = await redis.smembers(subscribersKey);

        if (subscribers.length === 0) {
            return NextResponse.json({ message: "No hay suscriptores registrados." });
        }

        // Simular obtención de mejores picks (en producción esto vendría de la base de datos o servicio de análisis)
        const topPicks = [
            { match: "Real Madrid vs Barcelona", recommendation: "Real Madrid Gana", confidence: 78 },
            { match: "LA Lakers vs Golden State", recommendation: "Over 225.5", confidence: 82 },
            { match: "Man City vs Arsenal", recommendation: "Ambos Anotan", confidence: 85 }
        ];

        const html = buildWeeklyPicksTemplate(topPicks);

        // Enviar correos (en producción usaríamos un worker o cola para no bloquear)
        const batchSize = 50;
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);
            await sendEmail({
                to: batch,
                subject: "🔥 Picks Ganadores de la Semana - PickGenius Pro",
                html
            });
        }

        return NextResponse.json({
            success: true,
            sentCount: subscribers.length
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
