import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil' as const,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    console.log('Checking session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session status:', session.status);

    return NextResponse.json({ status: session.status });
  } catch (error) {
    console.error('Error checking session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 