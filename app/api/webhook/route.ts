import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeUserCredits, updateSubscriptionStatus, SubscriptionStatus } from '@/lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

const PRICE_TO_PLAN = {
  'price_1R9ZdBPfnvEhFMZfpu6G5mvY': 'pro'
} as const;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const priceId = session.line_items?.data[0]?.price?.id;

        if (!userId || !priceId) {
          return NextResponse.json(
            { error: 'Missing required session data' },
            { status: 400 }
          );
        }

        if (!(priceId in PRICE_TO_PLAN)) {
          return NextResponse.json(
            { error: 'Invalid price ID' },
            { status: 400 }
          );
        }

        await initializeUserCredits(userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          return NextResponse.json(
            { error: 'Missing user ID in subscription metadata' },
            { status: 400 }
          );
        }

        await updateSubscriptionStatus(userId, subscription.status as SubscriptionStatus);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

// This is required to handle Stripe webhook events
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
