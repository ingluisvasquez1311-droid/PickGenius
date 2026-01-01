import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ STRIPE_SECRET_KEY is not defined. Stripe features will be disabled.');
}

export const stripe = new Stripe(stripeKey || 'sk_test_mock_key_for_build', {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
});

export const GOLD_PLAN_PRICE_ID = process.env.STRIPE_GOLD_PRICE_ID || '';
