"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface Referral {
    code: string;
    invitedBy?: string;
    referrals: string[]; // Array of user IDs that used this code
    rewards: {
        credits: number;
        premiumDays: number;
        isPermanentVIP: boolean;
    };
}

export const useReferrals = () => {
    const { user } = useUser();
    const [referralData, setReferralData] = useState<Referral | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const generateReferralCode = useCallback(() => {
        if (!user) return '';
        // Generate unique code: First 3 letters of username + last 4 of user ID
        const username = user.username || user.firstName || 'USER';
        const userId = user.id;
        return `${username.slice(0, 3).toUpperCase()}${userId.slice(-4)}`;
    }, [user]);

    const loadReferralData = useCallback(() => {
        if (!user) return;

        const storageKey = `pg_referrals_${user.id}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            setReferralData(JSON.parse(saved));
        } else {
            // Initialize new referral data
            const newData: Referral = {
                code: generateReferralCode(),
                referrals: [],
                rewards: {
                    credits: 0,
                    premiumDays: 0,
                    isPermanentVIP: false
                }
            };
            setReferralData(newData);
            localStorage.setItem(storageKey, JSON.stringify(newData));
        }
        setIsLoaded(true);
    }, [user, generateReferralCode]);

    useEffect(() => {
        loadReferralData();
    }, [loadReferralData]);

    const applyReferralCode = (code: string) => {
        if (!user || !referralData) return false;

        // Don't allow self-referral
        if (code === referralData.code) return false;

        // Check if already used a referral code
        if (referralData.invitedBy) return false;

        // Find the referrer
        const referrerKey = `pg_referral_lookup_${code}`;
        const referrerId = localStorage.getItem(referrerKey);

        if (!referrerId) {
            // Store this code for future lookup
            localStorage.setItem(`pg_referral_lookup_${referralData.code}`, user.id);
            return false;
        }

        // Update current user's data
        const updatedData = { ...referralData, invitedBy: code };
        setReferralData(updatedData);
        localStorage.setItem(`pg_referrals_${user.id}`, JSON.stringify(updatedData));

        // Update referrer's data
        const referrerDataKey = `pg_referrals_${referrerId}`;
        const referrerDataRaw = localStorage.getItem(referrerDataKey);

        if (referrerDataRaw) {
            const referrerData = JSON.parse(referrerDataRaw) as Referral;
            referrerData.referrals.push(user.id);

            // Calculate rewards
            const referralCount = referrerData.referrals.length;
            referrerData.rewards.credits += 500; // +500 credits per referral

            if (referralCount >= 5 && referralCount < 10) {
                referrerData.rewards.premiumDays = 30; // 1 month VIP at 5 referrals
            } else if (referralCount >= 10) {
                referrerData.rewards.isPermanentVIP = true; // Permanent VIP at 10
            }

            localStorage.setItem(referrerDataKey, JSON.stringify(referrerData));
        }

        return true;
    };

    const getReferralStats = () => {
        if (!referralData) return { count: 0, nextReward: '500 PGc', progress: 0 };

        const count = referralData.referrals.length;
        let nextReward = '500 PGc';
        let progress = 0;

        if (count < 5) {
            nextReward = `${5 - count} más para VIP 30 días`;
            progress = (count / 5) * 100;
        } else if (count < 10) {
            nextReward = `${10 - count} más para VIP Permanente`;
            progress = (count / 10) * 100;
        } else {
            nextReward = 'VIP Permanente Desbloqueado';
            progress = 100;
        }

        return { count, nextReward, progress };
    };

    const getShareUrl = () => {
        if (!referralData) return '';
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}?ref=${referralData.code}`;
    };

    return {
        referralData,
        isLoaded,
        applyReferralCode,
        getReferralStats,
        getShareUrl
    };
};
