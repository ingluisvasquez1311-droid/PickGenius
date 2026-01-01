import { NextRequest, NextResponse } from 'next/server';
import RedisManager from '@/lib/redis';
import { sendEmail, buildWeeklyPicksTemplate } from '@/lib/email-service';
import { currentUser } from '@clerk/nextjs/server';
import { AUTHORIZED_ADMIN_EMAIL } from '@/lib/admin';

/**
 * ADMIN ONLY: Triggers the weekly picks newsletter to all subscribers.
 */
export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const primaryEmail = user?.emailAddresses[0]?.emailAddress;

        const authHeader = req.headers.get('authorization');
        const isSecretMatch = authHeader === `Bearer ${process.env.ADMIN_SECRET_KEY}`;

        if (primaryEmail !== AUTHORIZED_ADMIN_EMAIL && !isSecretMatch) {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
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
