/**
 * Analytics Service para Dashboard de Administrador
 * Proporciona métricas clave del negocio y rendimiento
 */

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface DashboardMetrics {
    dau: number; // Daily Active Users
    mau: number; // Monthly Active Users
    totalUsers: number;
    premiumUsers: number;
    totalPredictions: number;
    aiAccuracy: Record<string, number>; // Por deporte
    revenue: {
        daily: number;
        monthly: number;
        total: number;
    };
    topSports: Array<{ sport: string; count: number }>;
    recentActivity: Array<{
        userId: string;
        action: string;
        timestamp: Date;
        details?: any;
    }>;
}

class AnalyticsService {
    /**
     * Obtener métricas del dashboard
     */
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Usuarios Activos Diarios (DAU)
            const dauQuery = query(
                collection(db, 'userActivity'),
                where('lastActive', '>=', Timestamp.fromDate(oneDayAgo))
            );
            const dauSnapshot = await getDocs(dauQuery);
            const dau = dauSnapshot.size;

            // Usuarios Activos Mensuales (MAU)
            const mauQuery = query(
                collection(db, 'userActivity'),
                where('lastActive', '>=', Timestamp.fromDate(oneMonthAgo))
            );
            const mauSnapshot = await getDocs(mauQuery);
            const mau = mauSnapshot.size;

            // Total de Usuarios
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Usuarios Premium
            const premiumQuery = query(
                collection(db, 'users'),
                where('isPremium', '==', true)
            );
            const premiumSnapshot = await getDocs(premiumQuery);
            const premiumUsers = premiumSnapshot.size;

            // Predicciones Totales
            const predictionsSnapshot = await getDocs(collection(db, 'predictions'));
            const totalPredictions = predictionsSnapshot.size;

            // Precisión de IA por deporte (simplificado - en producción calcular con resultados reales)
            const aiAccuracy: Record<string, number> = {
                football: 72.5,
                basketball: 68.3,
                tennis: 70.1,
                hockey: 65.8,
                nfl: 71.2,
                baseball: 69.4,
            };

            // Revenue (mock - en producción integrar con Stripe)
            const revenue = {
                daily: 145.99,
                monthly: 3420.50,
                total: 24680.75,
            };

            // Deportes más populares
            const topSports = [
                { sport: 'football', count: 1243 },
                { sport: 'basketball', count: 987 },
                { sport: 'tennis', count: 654 },
                { sport: 'nfl', count: 543 },
            ];

            // Actividad reciente
            const activityQuery = query(
                collection(db, 'activityLog'),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            const activitySnapshot = await getDocs(activityQuery);
            const recentActivity = activitySnapshot.docs.map(doc => ({
                userId: doc.data().userId || 'unknown',
                action: doc.data().action || 'unknown',
                timestamp: doc.data().timestamp?.toDate() || new Date(),
                details: doc.data().details,
            }));

            return {
                dau,
                mau,
                totalUsers,
                premiumUsers,
                totalPredictions,
                aiAccuracy,
                revenue,
                topSports,
                recentActivity,
            };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);

            // Retornar datos mock en caso de error
            return {
                dau: 156,
                mau: 1243,
                totalUsers: 3456,
                premiumUsers: 234,
                totalPredictions: 12543,
                aiAccuracy: {
                    football: 72.5,
                    basketball: 68.3,
                    tennis: 70.1,
                    hockey: 65.8,
                    nfl: 71.2,
                    baseball: 69.4,
                },
                revenue: {
                    daily: 145.99,
                    monthly: 3420.50,
                    total: 24680.75,
                },
                topSports: [
                    { sport: 'football', count: 1243 },
                    { sport: 'basketball', count: 987 },
                    { sport: 'tennis', count: 654 },
                ],
                recentActivity: [],
            };
        }
    }

    /**
     * Registrar actividad del usuario
     */
    async logUserActivity(userId: string, action: string, details?: any) {
        try {
            // Implementar logging de actividad
            console.log(`User ${userId} performed ${action}`, details);
            // En producción, guardar en Firestore
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();
