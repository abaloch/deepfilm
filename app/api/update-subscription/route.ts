import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

const INITIAL_CREDITS = 6;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved session:', session);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Get the subscription from the session
    const subscription = session.subscription
      ? await stripe.subscriptions.retrieve(session.subscription as string)
      : null;
    console.log('Retrieved subscription:', subscription);

    // Get the customer email from the session
    const email = session.customer_details?.email;
    if (!email) {
      return NextResponse.json(
        { error: 'No email found in session' },
        { status: 400 }
      );
    }

    // Update the user in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email,
        clerk_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription?.id,
        subscription_status: 'active',
        credits: INITIAL_CREDITS,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('User updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 