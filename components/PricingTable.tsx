'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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

const plans = [
  {
    name: 'Basic',
    price: '$9',
    period: '/month',
    features: [
      '10 video generations per month',
      'HD quality videos',
      'Basic editing tools',
      'Email support'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      '50 video generations per month',
      '4K quality videos',
      'Advanced editing tools',
      'Priority support',
      'Custom styles'
    ],
    buttonText: 'Get Started',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited video generations',
      '4K quality videos',
      'Advanced editing tools',
      'Dedicated support',
      'Custom styles',
      'API access'
    ],
    buttonText: 'Contact Us',
    popular: false
  }
];

export default function PricingTable() {
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
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-light mb-4">Choose Your Plan</h2>
        <p className="text-xl text-white/60">Select the perfect plan for your creative needs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 ${
              plan.popular
                ? 'bg-white/10 border border-white/20'
                : 'bg-black/50 border border-white/10'
            }`}
          >
            {plan.popular && (
              <div className="bg-white text-black text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-light mb-2">{plan.name}</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-light">{plan.price}</span>
              <span className="text-white/60 ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="w-5 h-5 text-white/60 mr-2 mt-0.5" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${
                plan.popular
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => handleSubscribe(plan.name.toLowerCase() as keyof typeof CREDITS_PER_MONTH)}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
