import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
// this is the route for the checkout session
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();

    if (!body.lookup_key) {
      return new NextResponse('Price ID is required', { status: 400 });
    }

    // Get the domain from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const domain = `${protocol}://${host}`;

    // First, find or create the customer
    const customers = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${userId}'`,
      limit: 1
    });

    let customer;
    if (customers.data.length === 0) {
      // Create a new customer if one doesn't exist
      customer = await stripe.customers.create({
        metadata: {
          clerkUserId: userId
        }
      });
    } else {
      customer = customers.data[0];
    }

    console.log('Creating checkout session for:', {
      userId,
      customerId: customer.id,
      priceId: body.lookup_key,
      domain
    });

    // Create the checkout session with the customer
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      ui_mode: 'embedded',
      line_items: [
        {
          price: body.lookup_key,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${domain}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        clerkUserId: userId
      }
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      clientSecret: session.client_secret,
      returnUrl: `${domain}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('ERROR in checkout session creation:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
