import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27-ac', // Using a recent stable version
    typescript: true,
});

export const GOLD_PLAN_PRICE_ID = process.env.STRIPE_GOLD_PRICE_ID || '';
