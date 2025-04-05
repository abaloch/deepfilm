import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeUserCredits, CREDITS_PER_MONTH, updateSubscriptionStatus } from '@/lib/credits';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

// Replace these with your actual Stripe price IDs
const PRICE_TO_PLAN = {
  'price_1R9ZdBPfnvEhFMZfpu6G5mvY': 'basic'
} as const;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid signature';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    if (!session.subscription || !session.metadata?.clerkId || !session.customer_email) {
      return NextResponse.json(
        { error: 'Missing required session data' },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const priceId = session.line_items?.data[0]?.price?.id;
    if (!priceId || !(priceId in PRICE_TO_PLAN)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    await initializeUserCredits(
      session.metadata.clerkId,
      session.customer_email,
      PRICE_TO_PLAN[priceId as keyof typeof PRICE_TO_PLAN],
      subscription.id,
      subscription.status as 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
    );

    return NextResponse.json({ 
      status: 'success',
      subscriptionId: subscription.id
    });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user's subscription status in your database
    // This is where you'd typically update your database
    // For now, we'll just return a success response
    return NextResponse.json({ 
      status: 'success',
      subscriptionId: subscription.id
    });
  }

  if (event.type === 'invoice.payment_failed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user's subscription status in your database
    // This is where you'd typically update your database
    // For now, we'll just return a success response
    return NextResponse.json({ 
      status: 'failed',
      subscriptionId: subscription.id
    });
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    if (!subscription.metadata?.clerkId) {
      return NextResponse.json(
        { error: 'Missing clerkId in subscription metadata' },
        { status: 400 }
      );
    }

    await updateSubscriptionStatus(
      subscription.metadata.clerkId,
      subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive',
      subscription.id
    );
  }

  return NextResponse.json({ received: true });
}

// This is required to handle Stripe webhook events
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
