'use client';

import { useEffect } from 'react';

declare global {
    namespace JSX {
      interface IntrinsicElements {
        'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        };
      }
    }
  }

export default function PricingTable() {
  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <stripe-pricing-table
        pricing-table-id="prctbl_1R9ZdBPfnvEhFMZfpu6G5mvY"
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
      />
    </div>
  );
}
