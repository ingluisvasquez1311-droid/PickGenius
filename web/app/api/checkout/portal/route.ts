import { auth, createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Logger from '@/lib/logger';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await clerkClient.users.getUser(userId);
        const stripeCustomerId = user.publicMetadata?.stripeCustomerId as string;

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 });
        }

        const origin = req.headers.get('origin');

        if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === '') {
            return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${origin}/profile`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        Logger.error('Stripe Portal Error', { error: err.message });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
