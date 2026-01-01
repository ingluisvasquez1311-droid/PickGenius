import { currentUser } from '@clerk/nextjs/server';

/**
 * AUTHORIZED ADMIN: luisvasquez1311@gmail.com
 * This is the ONLY user allowed to access administrative functions.
 */
export const AUTHORIZED_ADMIN_EMAIL = 'luisvasquez1311@gmail.com';

/**
 * Server-side check for admin authority.
 */
export async function checkAdminAuth() {
    const user = await currentUser();
    if (!user) return false;

    const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
        || user.emailAddresses[0]?.emailAddress;

    return primaryEmail === AUTHORIZED_ADMIN_EMAIL;
}

/**
 * Utility to verify if a given email is the authorized admin.
 */
export function isAuthorizedEmail(email: string | undefined) {
    if (!email) return false;
    return email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
