import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { sportsDataService } from './sportsDataService';
import { getUserProfile } from '../userService';

export interface PredictionResult {
    status: 'won' | 'lost' | 'push' | 'pending';
    score?: string;
    verifiedAt?: any;
}

/**
 * Verifica las predicciones pendientes de un usuario
 * @param uid ID del usuario
 */
export async function checkPendingPredictions(uid: string): Promise<number> {
    if (!uid || !db) return 0;

    try {
        const predictionsRef = collection(db, 'predictions');
        // Buscar solo predicciones que NO tienen campo 'status' o están 'pending'
        // Nota: Firebase no soporta OR directo en queries sin índices complejos para campos diferentes,
        // así que asumiremos que las nuevas se guardan sin status o 'pending'.
        // Por ahora buscamos las que no tienen 'verifiedAt' para ser más seguros.
        const q = query(
            predictionsRef,
            where('uid', '==', uid),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        let processedCount = 0;

        console.log(`🔍 [ResultService] Verificando ${querySnapshot.size} predicciones pendientes para ${uid}...`);

        for (const docSnapshot of querySnapshot.docs) {
            const prediction = docSnapshot.data();
            const predictionId = docSnapshot.id;

            // Evitar verificar eventos futuros recientes (ahorrar API calls)
            // Si el evento no ha empezado o empezó hace menos de 2 horas, saltar
            // Asumimos que prediction tiene gameTimestamp o startTimestamp
            /* 
            // Comentado por ahora para permitir verificar en testing
            const now = Date.now();
            const gameTime = prediction.timestamp?.toMillis ? prediction.timestamp.toMillis() : now;
            if (now < gameTime + (2 * 60 * 60 * 1000)) continue; 
            */

            if (!prediction.gameId) continue;

            // 1. Obtener resultado del evento
            const event = await sportsDataService.getEventById(prediction.gameId);

            if (!event || event.status.type !== 'finished') {
                continue; // El evento no existe o sigue en juego
            }

            // 2. Determinar si ganó o perdió
            // Por ahora soporte básico para Moneyline (Ganador)
            // TODO: Expandir para O/U, Handicaps, Props

            const result = calculatePredictionResult(prediction, event);

            if (result.status !== 'pending') {
                // 3. Actualizar predicción
                const predictionRef = doc(db, 'predictions', predictionId);
                await updateDoc(predictionRef, {
                    status: result.status,
                    resultScore: result.score,
                    verifiedAt: serverTimestamp()
                });

                // 4. Actualizar estadísticas del usuario
                const userRef = doc(db, 'users', uid);

                const statsUpdate: any = {};
                if (result.status === 'won') {
                    statsUpdate['stats.wins'] = increment(1);
                    // Si tenemos odds, podríamos calcular ROI aquí
                } else if (result.status === 'lost') {
                    statsUpdate['stats.losses'] = increment(1);
                } else {
                    statsUpdate['stats.pushes'] = increment(1);
                }

                await updateDoc(userRef, statsUpdate);
                processedCount++;
            }
        }

        return processedCount;

    } catch (error) {
        console.error('❌ [ResultService] Error verificando predicciones:', error);
        return 0;
    }
}

/**
 * Calcula el resultado de una predicción comparando con el evento final
 */
function calculatePredictionResult(prediction: any, event: any): PredictionResult {
    let status: 'won' | 'lost' | 'push' | 'pending' = 'pending';
    const homeScore = event.homeScore?.display ?? 0;
    const awayScore = event.awayScore?.display ?? 0;
    const finalScore = `${homeScore}-${awayScore}`;

    // Lógica para "Ganador" (Moneyline)
    // Asumimos que prediction.pick contiene el nombre del equipo o "Home"/"Away"
    // O mejor, intentamos normalizar

    // Si la predicción es explícita sobre el ganador
    const pick = prediction.pick?.toLowerCase() || '';
    const homeTeam = event.homeTeam.name.toLowerCase();
    const awayTeam = event.awayTeam.name.toLowerCase();

    // Determinar ganador real
    let winner = 'draw';
    if (homeScore > awayScore) winner = 'home';
    if (awayScore > homeScore) winner = 'away';

    let predictedWinner = '';
    if (pick.includes(homeTeam) || pick === 'home' || pick === '1') predictedWinner = 'home';
    if (pick.includes(awayTeam) || pick === 'away' || pick === '2') predictedWinner = 'away';

    // Verificación
    if (predictedWinner) {
        if (winner === predictedWinner) {
            status = 'won';
        } else if (winner === 'draw' && (event.sport?.slug === 'football' || event.tournament?.category?.sport?.slug === 'football')) {
            // En fútbol, si no apostaste empate, pierdes (a menos que sea Draw No Bet, pero asumimos 1X2 simple por ahora)
            status = 'lost';
        } else {
            status = 'lost';
        }
    }

    return {
        status,
        score: finalScore
    };
}
