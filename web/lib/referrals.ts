// Referral System Utilities

import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Referral {
    code: string;
    referrerId: string;
    referredUsers: string[];
    totalReferrals: number;
    bonusDaysEarned: number;
    createdAt: Date;
}

/**
 * Generate a unique referral code for a user
 */
export const generateReferralCode = (userId: string): string => {
    // Create a short, memorable code from user ID
    const hash = userId.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
    return `PG${code}`;
};

/**
 * Create or get referral data for a user
 */
export const getUserReferralData = async (userId: string): Promise<Referral | null> => {
    if (!db) return null;

    try {
        const referralRef = doc(db, 'referrals', userId);
        const referralSnap = await getDoc(referralRef);

        if (referralSnap.exists()) {
            return referralSnap.data() as Referral;
        }

        // Create new referral data
        const code = generateReferralCode(userId);
        const newReferral: Referral = {
            code,
            referrerId: userId,
            referredUsers: [],
            totalReferrals: 0,
            bonusDaysEarned: 0,
            createdAt: new Date(),
        };

        await setDoc(referralRef, newReferral);
        return newReferral;
    } catch (error) {
        console.error('Error getting referral data:', error);
        return null;
    }
};

/**
 * Find referrer by code
 */
export const findReferrerByCode = async (code: string): Promise<string | null> => {
    if (!db) return null;

    try {
        const referralsRef = collection(db, 'referrals');
        const q = query(referralsRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().referrerId;
        }

        return null;
    } catch (error) {
        console.error('Error finding referrer:', error);
        return null;
    }
};

/**
 * Process a referral (called when new user signs up with a code)
 */
export const processReferral = async (
    referrerId: string,
    newUserId: string
): Promise<boolean> => {
    if (!db) return false;

    try {
        const referralRef = doc(db, 'referrals', referrerId);

        // Update referrer's data
        await updateDoc(referralRef, {
            referredUsers: [...(await getDoc(referralRef)).data()?.referredUsers || [], newUserId],
            totalReferrals: increment(1),
            bonusDaysEarned: increment(3), // 3 bonus days per referral
        });

        // Award bonus days to referrer
        const userRef = doc(db, 'users', referrerId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const currentEnd = userSnap.data().subscriptionEnd?.toDate() || new Date();
            const newEnd = new Date(currentEnd);
            newEnd.setDate(newEnd.getDate() + 3);

            await updateDoc(userRef, {
                subscriptionEnd: newEnd,
            });
        }

        return true;
    } catch (error) {
        console.error('Error processing referral:', error);
        return false;
    }
};
