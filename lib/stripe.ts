import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

export const PRICE_IDS = {
  basic: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY' // $15/month for 6 credits
} as const;
