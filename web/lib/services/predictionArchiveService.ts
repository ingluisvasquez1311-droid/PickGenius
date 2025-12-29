import { getFirestore } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

export interface PredictionRecord {
    id?: string;
    uid: string;
    gameId?: string;
    sport: string;
    winner?: string;
    bettingTip?: string;
    confidence: string | number;
    reasoning: string;
    timestamp?: any;
}

/**
 * Servicio para archivar predicciones y actualizar estadísticas desde el servidor
 * Utiliza Admin SDK para saltar reglas de seguridad
 */
export async function archivePredictionOnServer(uid: string, prediction: Omit<PredictionRecord, 'uid' | 'timestamp'>) {
    try {
        const db = getFirestore();
        const isGuest = !uid || uid === 'guest';
        const finalUid = isGuest ? 'guest' : uid;

        // 1. Guardar en historial del usuario (Estructura compatible con firestore.rules)
        if (!isGuest) {
            const userHistoryRef = db.collection('predictions').doc(finalUid).collection('history');
            await userHistoryRef.add({
                ...prediction,
                uid: finalUid,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString()
            });
        }

        // 2. Guardar en estadísticas globales (Live Feed)
        const globalRef = db.collection('stats_predictions');
        await globalRef.add({
            gameId: prediction.gameId || 'N/A',
            pick: prediction.bettingTip || prediction.winner || 'Consult IA',
            confidence: prediction.confidence || 0,
            sport: prediction.sport || 'football',
            isGuest,
            userEmail: isGuest ? 'Invitado' : 'Usuario Registrado',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // 3. Actualizar contadores del usuario
        if (!isGuest) {
            const userRef = db.collection('users').doc(finalUid);

            // Determinar qué estadística incrementar
            let statToIncrement = 'stats.resultados';
            if (prediction.sport === 'basketball') statToIncrement = 'stats.anotadores';

            await userRef.update({
                predictionsUsed: admin.firestore.FieldValue.increment(1),
                totalPredictions: admin.firestore.FieldValue.increment(1),
                [statToIncrement]: admin.firestore.FieldValue.increment(1),
                'stats.reputation': admin.firestore.FieldValue.increment(15)
            }).catch(() => null); // Silenciar si el documento no existe (raro)
        }

        console.log(`✅ [ArchiveService] Prediction archived for ${finalUid}`);
        return { success: true };
    } catch (error) {
        console.error('❌ [ArchiveService] Error archiving prediction:', error);
        return { success: false, error };
    }
}
