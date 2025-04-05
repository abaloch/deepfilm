import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeUserCredits, updateSubscriptionStatus, SubscriptionStatus } from '@/lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

const PRICE_TO_PLAN = {
  'price_1R9ZdBPfnvEhFMZfpu6G5mvY': 'basic'
} as const;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.metadata?.clerkId || !session.metadata?.email) {
          return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 });
        }

        const priceId = session.line_items?.data[0]?.price?.id as keyof typeof PRICE_TO_PLAN;
        if (!priceId || !PRICE_TO_PLAN[priceId]) {
          return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
        }

        await initializeUserCredits(
          session.metadata.clerkId,
          session.metadata.email,
          PRICE_TO_PLAN[priceId],
          session.subscription as string,
          'active'
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (!subscription.metadata?.clerkId) {
          return NextResponse.json({ error: 'Missing clerk ID in subscription metadata' }, { status: 400 });
        }

        await updateSubscriptionStatus(
          subscription.metadata.clerkId,
          subscription.status as SubscriptionStatus,
          subscription.id
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// This is required to handle Stripe webhook events
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
