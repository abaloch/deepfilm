import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeUserCredits, CREDITS_PER_MONTH, updateSubscriptionStatus, SubscriptionStatus } from '@/lib/credits';
import { Stripe } from 'stripe';
import { supabase } from '@/lib/supabase';

// Configure route handler options
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const INITIAL_CREDITS = 6;

type Plan = 'basic';

// Price ID to plan mapping
const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRICE_ID || '']: 'basic'
};

// Map Stripe subscription status to our application status
function mapStripeStatusToAppStatus(stripeStatus: string): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
      return 'incomplete';
    case 'incomplete_expired':
      return 'incomplete_expired';
    case 'unpaid':
      return 'unpaid';
    default:
      return 'incomplete';
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  console.log('Webhook received with signature:', signature);

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook event constructed successfully:', event.type);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        
        console.log('Checkout session completed:', {
          sessionId: session.id,
          clerkUserId,
          customerId: session.customer,
          metadata: session.metadata
        });

        if (!clerkUserId || !session.customer) {
          console.error('Missing metadata in session:', {
            sessionId: session.id,
            metadata: session.metadata,
            customerId: session.customer
          });
          return new NextResponse('Missing required metadata', { status: 400 });
        }

        // Get the customer to get their email
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        const customerEmail = customer.email;

        if (!customerEmail) {
          console.error('Customer email not found:', {
            customerId: session.customer,
            customer
          });
          return new NextResponse('Customer email not found', { status: 400 });
        }

        // Get the subscription to determine the plan
        let subscription;
        try {
          subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        } catch (error) {
          console.error('Error retrieving subscription:', error);
          return new NextResponse('Failed to retrieve subscription', { status: 400 });
        }

        if (!subscription) {
          console.error('No subscription found for session:', session.id);
          return new NextResponse('No subscription found', { status: 400 });
        }

        const priceId = subscription.items.data[0].price.id;
        
        // Get the plan from the price ID
        const plan = PRICE_TO_PLAN[priceId] || 'basic';

        console.log('Initializing credits for user:', {
          clerkUserId,
          customerEmail,
          plan,
          subscriptionId: subscription.id,
          status: subscription.status,
          priceId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        });

        // Initialize credits for the user
        try {
          const mappedStatus = mapStripeStatusToAppStatus(subscription.status);
          console.log('Mapping Stripe status to app status:', {
            stripeStatus: subscription.status,
            mappedStatus
          });

          const user = await initializeUserCredits(
            clerkUserId,
            customerEmail,
            plan,
            subscription.id,
            mappedStatus
          );

          console.log('User credits initialized successfully:', {
            userId: user?.id,
            credits: user?.credits,
            subscriptionStatus: user?.subscription_status
          });
        } catch (error) {
          console.error('Failed to initialize user credits:', error);
          throw error;
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = subscription.metadata.clerkUserId;

        console.log('Subscription updated/deleted:', {
          subscriptionId: subscription.id,
          clerkUserId,
          status: subscription.status,
          metadata: subscription.metadata
        });

        if (!clerkUserId) {
          console.error('Missing clerkUserId in subscription:', {
            subscriptionId: subscription.id,
            metadata: subscription.metadata
          });
          return new NextResponse('Missing clerkUserId in subscription metadata', { status: 400 });
        }

        const mappedStatus = mapStripeStatusToAppStatus(subscription.status);
        await updateSubscriptionStatus(
          clerkUserId,
          mappedStatus,
          subscription.id
        );

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription: string };
        if (!invoice.subscription) {
          console.error('Invoice has no subscription:', invoice.id);
          return new NextResponse('Invoice has no subscription', { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const clerkUserId = subscription.metadata.clerkUserId;

        console.log('Invoice payment succeeded:', {
          invoiceId: invoice.id,
          subscriptionId: subscription.id,
          clerkUserId,
          metadata: subscription.metadata
        });

        if (!clerkUserId) {
          console.error('Missing clerkUserId in subscription:', {
            subscriptionId: subscription.id,
            metadata: subscription.metadata
          });
          return new NextResponse('Missing clerkUserId in subscription metadata', { status: 400 });
        }

        // Get the customer to get their email
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const customerEmail = customer.email;

        if (!customerEmail) {
          console.error('Customer email not found:', {
            customerId: subscription.customer,
            customer
          });
          return new NextResponse('Customer email not found', { status: 400 });
        }

        // Get the plan from the price ID
        const priceId = subscription.items.data[0].price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'basic';

        // Add monthly credits when payment succeeds
        const user = await initializeUserCredits(
          clerkUserId,
          customerEmail,
          plan,
          subscription.id,
          subscription.status as any
        );

        console.log('User credits updated after payment:', user);

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}

// This is required to handle Stripe webhook events
