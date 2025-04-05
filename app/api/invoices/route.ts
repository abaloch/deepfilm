import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the customer associated with the Clerk user ID
    const customers = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${userId}'`,
      limit: 1
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ invoices: [] });
    }

    // Get all invoices for the customer
    const invoices = await stripe.invoices.list({
      customer: customers.data[0].id,
      limit: 24, // Last 24 invoices
    });

    return NextResponse.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: invoice.created,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
      }))
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
} 