import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const PRICE_IDS = {
  basic: 'price_1RB7qfB3GdKAaOkrjpPCnIrl' // $15/month for 6 credits
} as const;
