import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST() {
  try {
    // Get the price from your Stripe pricing table
    const price = await stripe.prices.retrieve('price_1R9ZdBPfnvEhFMZfpu6G5mvY');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        product: 'premium_subscription',
        price_id: price.id
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 