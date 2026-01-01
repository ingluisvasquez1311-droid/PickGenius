import { NextRequest, NextResponse } from 'next/server';
import RedisManager from '@/lib/redis';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { matchId: string } }
) {
    try {
        const { matchId } = params;
        const redis = RedisManager.getInstance();
        const key = `comments:${matchId}`;

        // Obtener los últimos 50 comentarios
        const comments = await redis.lrange(key, 0, 49);
        const parsedComments = comments.map(c => JSON.parse(c));

        return NextResponse.json({ comments: parsedComments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { matchId: string } }
) {
    try {
        const { matchId } = params;
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Debe iniciar sesión para comentar" }, { status: 401 });
        }

        const { text } = await req.json();
        if (!text || text.trim() === '') {
            return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 });
        }

        const redis = RedisManager.getInstance();
        const key = `comments:${matchId}`;

        const newComment = {
            id: Date.now().toString(),
            userId: user.id,
            userName: `${user.firstName} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
            userImage: user.imageUrl,
            text: text.substring(0, 500), // Limitar longitud
            createdAt: new Date().toISOString(),
            isGold: user.publicMetadata?.isGold === true || user.publicMetadata?.role === 'admin'
        };

        // 1. Persistencia Rápida (Redis) para el Live Feed
        await redis.lpush(key, JSON.stringify(newComment));
        await redis.ltrim(key, 0, 99);

        // 2. Persistencia Permanente (Firestore)
        try {
            const { db } = await import('@/lib/firebase-admin');
            if (db) {
                await db.collection('match_comments').doc(newComment.id).set({
                    ...newComment,
                    matchId,
                    timestamp: new Date()
                });
            }
        } catch (dbError) {
            console.error('[Firebase Persist Error]:', dbError);
            // No bloqueamos el flujo si falla Firestore, Redis sigue vivo
        }

        return NextResponse.json(newComment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { matchId: string } }
) {
    try {
        const { matchId } = params;
        const user = await currentUser();
        const { commentId } = await req.json();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const isAdmin = user.publicMetadata?.role === 'admin';
        const redis = RedisManager.getInstance();
        const key = `comments:${matchId}`;

        // Obtener comentarios para encontrar el exacto (necesario para LREM en Redis list)
        const comments = await redis.lrange(key, 0, -1);
        let targetCommentStr = null;

        for (const cStr of comments) {
            const c = JSON.parse(cStr);
            if (c.id === commentId) {
                // Solo el autor o un admin puede borrar
                if (c.userId === user.id || isAdmin) {
                    targetCommentStr = cStr;
                }
                break;
            }
        }

        if (targetCommentStr) {
            // Borrar de Redis
            await redis.lrem(key, 1, targetCommentStr);

            // Borrar de Firestore
            try {
                const { db } = await import('@/lib/firebase-admin');
                if (db) {
                    await db.collection('match_comments').doc(commentId).delete();
                }
            } catch (fsError) {
                console.error('[Firebase Delete Error]:', fsError);
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "No encontrado o sin permisos" }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
