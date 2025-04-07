import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_ID || 'price_1RB7qfB3GdKAaOkrjpPCnIrl' // Fallback for development
};
