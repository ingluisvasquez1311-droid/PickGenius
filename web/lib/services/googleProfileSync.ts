import { User } from 'firebase/auth';
import { updateUserProfile } from '../userService';

/**
 * Sincroniza el perfil de usuario con los datos de Google
 * @param firebaseUser - Usuario de Firebase Auth
 */
export async function syncGoogleProfile(firebaseUser: User): Promise<void> {
    const uid = firebaseUser.uid;
    const displayName = firebaseUser.displayName;
    const photoURL = firebaseUser.photoURL;
    const email = firebaseUser.email;

    console.log('🔄 [Google Sync] Iniciando sincronización de perfil...');
    console.log('👤 [Google Sync] Display Name:', displayName);
    console.log('🖼️ [Google Sync] Photo URL:', photoURL ? 'Sí' : 'No');

    try {
        // Actualizar perfil en Firestore con datos de Google
        const updates: any = {};

        if (displayName) {
            updates.displayName = displayName;
        }

        if (photoURL) {
            updates.photoURL = photoURL;
        }

        // Bio automática si no existe
        if (displayName) {
            updates.bio = `Usuario autenticado con Google - ${displayName}`;
        }

        // Solo actualizar si hay cambios
        if (Object.keys(updates).length > 0) {
            await updateUserProfile(uid, updates);
            console.log('✅ [Google Sync] Perfil sincronizado correctamente:', updates);
        } else {
            console.log('ℹ️ [Google Sync] No hay datos nuevos para sincronizar');
        }
    } catch (error) {
        console.error('❌ [Google Sync] Error al sincronizar perfil:', error);
        // No hacer throw para no interrumpir el flujo de login
    }
}

/**
 * Verifica si un usuario se autenticó con Google
 * @param firebaseUser - Usuario de Firebase Auth
 */
export function isGoogleUser(firebaseUser: User): boolean {
    return firebaseUser.providerData.some(
        provider => provider.providerId === 'google.com'
    );
}
