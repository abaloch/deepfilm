import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { Stripe } from 'stripe';

// This is required to handle Stripe webhook events
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const preferredRegion = 'auto';

// Disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const INITIAL_CREDITS = 6;

async function updateSupabaseUser(clerkUserId: string, data: any) {
  console.log('Attempting to update Supabase user:', { clerkUserId, data });

  // First check if user exists
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkUserId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking for existing user:', selectError);
    throw new Error('Failed to check existing user');
  }

  console.log('Existing user data:', existingUser);

  if (existingUser) {
    // Update existing user
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update(data)
      .eq('clerk_id', clerkUserId)
      .select();

    if (updateError) {
      console.error('Error updating user:', updateError);
      throw new Error('Failed to update user');
    }

    console.log('Successfully updated user:', updateResult);
    return updateResult;
  } else {
    // Insert new user
    const { data: insertResult, error: insertError } = await supabase
      .from('users')
      .insert([{ clerk_id: clerkUserId, ...data }])
      .select();

    if (insertError) {
      console.error('Error inserting new user:', insertError);
      throw new Error('Failed to insert new user');
    }

    console.log('Successfully inserted new user:', insertResult);
    return insertResult;
  }
}

export async function POST(req: Request) {
  console.log('=================== WEBHOOK START ===================');
  console.log('Webhook received at:', new Date().toISOString());
  
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook event constructed successfully:', {
      type: event.type,
      id: event.id
    });
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          customerId: session.customer,
          metadata: session.metadata,
          mode: session.mode
        });

        if (!session.metadata?.clerkUserId) {
          throw new Error('No clerkUserId found in session metadata');
        }

        // Get subscription details if this is a subscription checkout
        let subscriptionStatus = 'active';
        let subscriptionId = null;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionStatus = subscription.status;
          subscriptionId = subscription.id;
          console.log('Retrieved subscription details:', {
            subscriptionId: subscription.id,
            status: subscription.status
          });
        }

        // Update user in Supabase
        await updateSupabaseUser(session.metadata.clerkUserId, {
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscriptionStatus,
          credits: INITIAL_CREDITS,
          updated_at: new Date().toISOString()
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get the customer to find the clerkUserId
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const clerkUserId = customer.metadata.clerkUserId;
        console.log('Processing subscription event:', {
          type: event.type,
          subscriptionId: subscription.id,
          status: subscription.status
        });

        if (!clerkUserId) {
          console.error('No clerkUserId found for customer:', customerId);
          return new NextResponse(
            JSON.stringify({ error: 'No clerkUserId found' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Update user in Supabase
        await updateSupabaseUser(clerkUserId, {
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
          credits: INITIAL_CREDITS,
          updated_at: new Date().toISOString()
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get the customer to find the clerkUserId
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const clerkUserId = customer.metadata.clerkUserId;

        if (!clerkUserId) {
          console.error('No clerkUserId found for customer:', customerId);
          return new NextResponse(
            JSON.stringify({ error: 'No clerkUserId found' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Update user in Supabase
        await updateSupabaseUser(clerkUserId, {
          subscription_status: 'inactive',
          stripe_subscription_id: null,
          credits: 0,
          updated_at: new Date().toISOString()
        });

        break;
      }
    }

    console.log('=================== WEBHOOK END ===================');
    return new NextResponse(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 