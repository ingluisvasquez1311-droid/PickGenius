import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;

            if (userId) {
                console.log(`✅ Payment success for user: ${userId}`);

                // Update user to Premium in Firestore
                await adminDb.collection('users').doc(userId).update({
                    isPremium: true,
                    predictionsLimit: 9999,
                    subscriptionId: session.subscription,
                    customerId: session.customer,
                    updatedAt: new Date().toISOString()
                });
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            // Find user by subscription ID and downgrade
            const userSnapshot = await adminDb.collection('users').where('subscriptionId', '==', subscription.id).get();

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                console.log(`📉 Subscription cancelled for user: ${userDoc.id}`);
                await userDoc.ref.update({
                    isPremium: false,
                    predictionsLimit: 5, // Back to free limit
                    subscriptionId: null,
                    updatedAt: new Date().toISOString()
                });
            }
            break;

        default:
            console.log(`🟡 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
