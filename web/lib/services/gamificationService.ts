/**
 * Gamification Service - Sistema de Puntos y Niveles
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, where, orderBy, limit, getDocs } from 'firestore';

// Definición de niveles
export const LEVELS = {
    APPRENTICE: { name: 'Apprentice', minPoints: 0, maxPoints: 999, color: '#6B7280', icon: '🌱' },
    PRO: { name: 'Pro', minPoints: 1000, maxPoints: 4999, color: '#3B82F6', icon: '⚡' },
    MASTER: { name: 'Master', minPoints: 5000, maxPoints: 14999, color: '#8B5CF6', icon: '👑' },
    ORACLE: { name: 'Oracle', minPoints: 15000, maxPoints: Infinity, color: '#F59E0B', icon: '🔮' },
};

// Acciones que otorgan puntos
export const POINT_ACTIONS = {
    CORRECT_PREDICTION: 100,
    COMMENT_ON_MATCH: 10,
    REFER_FRIEND: 500,
    LOGIN_STREAK_DAILY: 25,
    SHARE_PREDICTION: 50,
    COMPLETE_PROFILE: 200,
};

// Badges/Logros
export const BADGES = {
    FIRST_WIN: { id: 'first_win', name: 'Primera Victoria', description: 'Tu primera predicción correcta', points: 50, icon: '🎯' },
    WINNING_STREAK_5: { id: 'streak_5', name: 'Racha de 5', description: '5 predicciones correctas seguidas', points: 250, icon: '🔥' },
    WINNING_STREAK_10: { id: 'streak_10', name: 'Racha de 10', description: '10 predicciones correctas seguidas', points: 500, icon: '💎' },
    PERFECT_WEEK: { id: 'perfect_week', name: 'Semana Perfecta', description: '7 días seguidos con predicciones correctas', points: 750, icon: '✨' },
    COMMENT_MASTER: { id: 'comment_master', name: 'Comentarista', description: '100 comentarios publicados', points: 300, icon: '💬' },
    REFERRAL_CHAMPION: { id: 'referral_champ', name: 'Embajador', description: 'Referir 5 amigos', points: 1000, icon: '🎖️' },
};

class GamificationService {
    /**
     * Obtener perfil de gamificación del usuario
     */
    async getUserGamification(userId: string) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                return this.getDefaultGamification();
            }

            const data = userSnap.data();
            const points = data.geniusPoints || 0;
            const level = this.getLevelFromPoints(points);

            return {
                points,
                level,
                badges: data.badges || [],
                winningStreak: data.winningStreak || 0,
                totalPredictions: data.totalPredictions || 0,
                correctPredictions: data.correctPredictions || 0,
                accuracy: data.totalPredictions > 0
                    ? Math.round((data.correctPredictions / data.totalPredictions) * 100)
                    : 0,
                loginStreak: data.loginStreak || 0,
                referrals: data.referrals || 0,
            };
        } catch (error) {
            console.error('Error fetching gamification:', error);
            return this.getDefaultGamification();
        }
    }

    /**
     * Otorgar puntos al usuario
     */
    async awardPoints(userId: string, action: keyof typeof POINT_ACTIONS, metadata?: any) {
        try {
            const points = POINT_ACTIONS[action];
            const userRef = doc(db, 'users', userId);

            await updateDoc(userRef, {
                geniusPoints: increment(points),
                lastPointsAction: {
                    action,
                    points,
                    timestamp: new Date(),
                    metadata,
                },
            });

            // Verificar si desbloquea un badge
            await this.checkBadges(userId);

            return { success: true, points };
        } catch (error) {
            console.error('Error awarding points:', error);
            return { success: false, error };
        }
    }

    /**
     * Verificar y otorgar badges
     */
    private async checkBadges(userId: string) {
        try {
            const gamification = await this.getUserGamification(userId);
            const userRef = doc(db, 'users', userId);
            const newBadges: string[] = [];

            // Primera victoria
            if (gamification.correctPredictions >= 1 && !gamification.badges.includes('first_win')) {
                newBadges.push('first_win');
            }

            // Racha de 5
            if (gamification.winningStreak >= 5 && !gamification.badges.includes('streak_5')) {
                newBadges.push('streak_5');
            }

            // Racha de 10
            if (gamification.winningStreak >= 10 && !gamification.badges.includes('streak_10')) {
                newBadges.push('streak_10');
            }

            // Otorgar nuevos badges
            if (newBadges.length > 0) {
                await updateDoc(userRef, {
                    badges: [...gamification.badges, ...newBadges],
                });

                // Otorgar puntos por badges
                const badgePoints = newBadges.reduce((sum, badgeId) => {
                    const badge = Object.values(BADGES).find(b => b.id === badgeId);
                    return sum + (badge?.points || 0);
                }, 0);

                if (badgePoints > 0) {
                    await updateDoc(userRef, {
                        geniusPoints: increment(badgePoints),
                    });
                }
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
    }

    /**
     * Obtener nivel desde puntos
     */
    getLevelFromPoints(points: number) {
        if (points >= LEVELS.ORACLE.minPoints) return LEVELS.ORACLE;
        if (points >= LEVELS.MASTER.minPoints) return LEVELS.MASTER;
        if (points >= LEVELS.PRO.minPoints) return LEVELS.PRO;
        return LEVELS.APPRENTICE;
    }

    /**
     * Obtener gamificación por defecto
     */
    private getDefaultGamification() {
        return {
            points: 0,
            level: LEVELS.APPRENTICE,
            badges: [],
            winningStreak: 0,
            totalPredictions: 0,
            correctPredictions: 0,
            accuracy: 0,
            loginStreak: 0,
            referrals: 0,
        };
    }

    /**
     * Obtener ranking global
     */
    async getLeaderboard(limitCount = 50) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                orderBy('geniusPoints', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const leaderboard = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    rank: index + 1,
                    userId: doc.id,
                    displayName: data.displayName || 'Usuario Anónimo',
                    photoURL: data.photoURL || null,
                    points: data.geniusPoints || 0,
                    level: this.getLevelFromPoints(data.geniusPoints || 0),
                    accuracy: data.totalPredictions > 0
                        ? Math.round((data.correctPredictions / data.totalPredictions) * 100)
                        : 0,
                    badges: data.badges || [],
                };
            });

            return leaderboard;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
}

export const gamificationService = new GamificationService();
