import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe, GOLD_PLAN_PRICE_ID } from '@/lib/stripe';
import Logger from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const origin = req.headers.get('origin');

        if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === '') {
            return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
        }

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price: GOLD_PLAN_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment/cancel`,
            metadata: {
                userId: userId,
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                }
            }
        });

        if (!session.url) {
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        Logger.error('Stripe Checkout Error', { error: err.message });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
