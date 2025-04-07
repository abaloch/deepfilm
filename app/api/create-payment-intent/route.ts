import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRICE_IDS } from '@/lib/stripe';

export async function POST() {
  try {
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error('STRIPE_PRICE_ID is not set');
    }

    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
    
    if (!price.unit_amount) {
      throw new Error('Price unit amount is missing');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        price_id: price.id
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 