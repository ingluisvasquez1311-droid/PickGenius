import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import Logger from '@/lib/logger';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        Logger.error('Webhook signature verification failed', { error: err.message });
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    const session = event.data.object as any;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const userId = session.metadata?.userId;
            if (userId) {
                Logger.info('Stripe Webhook: Checkout Completed', { userId });
                await clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        isGold: true,
                        plan: 'gold',
                        stripeCustomerId: session.customer
                    }
                });
            }
            break;

        case 'customer.subscription.deleted':
            const subUserId = session.metadata?.userId;
            if (subUserId) {
                Logger.info('Stripe Webhook: Subscription Deleted', { userId: subUserId });
                await clerkClient.users.updateUserMetadata(subUserId, {
                    publicMetadata: {
                        isGold: false,
                        plan: 'free'
                    }
                });
            }
            break;

        default:
            Logger.info('Unhandled Stripe event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
}
