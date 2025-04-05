'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

const CREDITS_PER_MONTH = {
  basic: 10,
  pro: 50,
  enterprise: 200
};

const PRICE_IDS = {
  basic: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY',
  pro: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY',
  enterprise: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY'
};

export default function PricingTable() {
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof CREDITS_PER_MONTH>('basic');
  const { userId } = useAuth();

  const handleSubscribe = async (plan: keyof typeof CREDITS_PER_MONTH) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: PRICE_IDS[plan],
          plan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-light tracking-wider text-white mb-4"
        >
          PRICING
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/60 mb-12"
        >
          Choose the plan that&apos;s right for you
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(CREDITS_PER_MONTH).map(([plan, credits], index) => (
          <motion.div
            key={plan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/5 rounded-lg p-8 border ${
              selectedPlan === plan
                ? 'border-white/20'
                : 'border-white/10'
            }`}
          >
            <h3 className="text-2xl font-light text-white mb-4">
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </h3>
            <p className="text-4xl font-light text-white mb-6">
              {credits} credits
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white/60">
                <svg
                  className="w-5 h-5 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {credits} video generations per month
              </li>
              <li className="flex items-center text-white/60">
                <svg
                  className="w-5 h-5 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Priority support
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe(plan as keyof typeof CREDITS_PER_MONTH)}
              className="w-full bg-white text-black py-3 px-6 rounded-lg font-light tracking-wider hover:bg-white/90 transition-colors"
            >
              Subscribe
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
