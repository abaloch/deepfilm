'use client'

import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribePage() {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(() => {
    setError(null);
    return fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create checkout session');
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        return data.clientSecret;
      })
      .catch((err) => {
        console.error('Error creating checkout session:', err);
        setError(err.message);
        throw err;
      });
  }, []);

  const options = { fetchClientSecret };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-4xl">
        <div className="bg-black border border-white/10 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Subscribe to Premium</h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          <div id="checkout">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={options}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
