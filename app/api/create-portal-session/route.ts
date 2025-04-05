import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    console.log('Starting portal session creation...');
    
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      console.log('No userId found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the customer associated with the Clerk user ID
    console.log('Searching for customer with userId:', userId);
    const customers = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${userId}'`,
      limit: 1
    });

    console.log('Found customers:', customers.data.length);

    if (customers.data.length === 0) {
      console.log('No customer found');
      return new NextResponse('Customer not found', { status: 404 });
    }

    const customer = customers.data[0];
    console.log('Found customer:', customer.id);

    // Get the domain from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const domain = `${protocol}://${host}`;

    // Create a billing portal session
    console.log('Creating portal session...');
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${domain}/generate`,
    });

    console.log('Portal session created:', session.url);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
