import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeUserCredits, CREDITS_PER_MONTH, updateSubscriptionStatus } from '@/lib/credits';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

// Replace these with your actual Stripe price IDs
const PRICE_TO_PLAN: { [key: string]: keyof typeof CREDITS_PER_MONTH } = {
  'price_1R9ZdBPfnvEhFMZfpu6G5mvY': 'basic'
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

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
        webhookSecret
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
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Update user's subscription status in your database
      // This is where you'd typically update your database
      // For now, we'll just return a success response
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

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// This is required to handle Stripe webhook events
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
