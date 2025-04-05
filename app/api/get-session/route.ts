import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    console.log('Retrieving session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Retrieving customer:', session.customer);
    const customer = await stripe.customers.retrieve(session.customer as string);

    // Check if customer is deleted
    if ((customer as Stripe.DeletedCustomer).deleted) {
      return NextResponse.json({
        customerName: 'valued customer',
        sessionId: session.id,
        subscriptionId: session.subscription,
        customerId: session.customer
      });
    }

    // Customer exists
    const activeCustomer = customer as Stripe.Customer;
    return NextResponse.json({
      customerName: activeCustomer.name || 'valued customer',
      sessionId: session.id,
      subscriptionId: session.subscription,
      customerId: session.customer
    });
  } catch (error: any) {
    console.error('Error retrieving session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 