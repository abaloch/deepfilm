import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { Stripe } from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get the customer to find the clerkUserId
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const clerkUserId = customer.metadata.clerkUserId;

        if (!clerkUserId) {
          console.error('No clerkUserId found for customer:', customerId);
          return new NextResponse('No clerkUserId found', { status: 400 });
        }

        // Update the user's subscription status in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id
          })
          .eq('clerk_id', clerkUserId);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          return new NextResponse('Error updating subscription status', { status: 500 });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;
        
        // Get the customer to find the clerkUserId
        const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId) as Stripe.Customer;
        const deletedClerkUserId = deletedCustomer.metadata.clerkUserId;

        if (!deletedClerkUserId) {
          console.error('No clerkUserId found for deleted customer:', deletedCustomerId);
          return new NextResponse('No clerkUserId found', { status: 400 });
        }

        // Update the user's subscription status to inactive
        const { error: deleteError } = await supabase
          .from('users')
          .update({
            subscription_status: 'inactive',
            stripe_subscription_id: null
          })
          .eq('clerk_id', deletedClerkUserId);

        if (deleteError) {
          console.error('Error updating deleted subscription status:', deleteError);
          return new NextResponse('Error updating subscription status', { status: 500 });
        }

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
} 