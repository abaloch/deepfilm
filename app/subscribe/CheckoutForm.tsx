'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'An error occurred');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push('/subscribe');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-800 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`w-full bg-white text-black py-3 px-6 rounded-full font-medium 
              ${(!stripe || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90'} 
              transition-colors`}
          >
            {isProcessing ? 'Processing...' : 'Subscribe Now'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-white/10 text-white py-3 px-6 rounded-full font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 