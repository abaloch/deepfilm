import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

const INITIAL_CREDITS = 6;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    console.log('Retrieving session:', sessionId);
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });
    
    if (!session) {
      return new NextResponse('Session not found', { status: 404 });
    }

    // Get customer email from the session
    const email = session.customer_details?.email;
    if (!email) {
      return new NextResponse('Customer email not found', { status: 400 });
    }

    // Get customer ID
    const customerId = session.customer;
    if (!customerId) {
      return new NextResponse('Customer ID not found', { status: 400 });
    }

    // Get subscription ID
    const subscriptionId = session.subscription;
    if (!subscriptionId) {
      return new NextResponse('Subscription ID not found', { status: 400 });
    }

    console.log('Session retrieved:', {
      sessionId: session.id,
      customerId,
      subscriptionId,
      email
    });

    // Update user in Supabase
    console.log('Updating Supabase user:', {
      clerkId: userId,
      email,
      customerId,
      subscriptionId,
      status: 'active',
      credits: INITIAL_CREDITS
    });

    const { data, error } = await supabase
      .from('users')
      .update({
        email: email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        credits: INITIAL_CREDITS,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return new NextResponse('Error updating user', { status: 500 });
    }

    console.log('User updated successfully:', data);

    return NextResponse.json({
      success: true,
      subscriptionStatus: 'active',
      credits: INITIAL_CREDITS,
      data
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
} 