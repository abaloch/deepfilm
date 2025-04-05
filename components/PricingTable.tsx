'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out DeepFilm',
    features: [
      '5 free credits',
      'Basic video generation',
      'Standard quality output',
      'Community support'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
    credits: 5
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For serious creators',
    features: [
      '100 credits per month',
      'Priority video generation',
      'High quality output',
      'Priority support',
      'Custom video styles'
    ],
    buttonText: 'Subscribe',
    buttonVariant: 'default' as const,
    credits: 100
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For businesses and teams',
    features: [
      'Unlimited credits',
      'Dedicated support',
      'Custom integrations',
      'Team management',
      'API access',
      'Custom video styles'
    ],
    buttonText: 'Contact Us',
    buttonVariant: 'outline' as const,
    credits: 'unlimited'
  }
];

export default function PricingTable() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (isSignedIn) {
      router.push('/generate');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-light tracking-wider mb-4">Choose Your Plan</h2>
        <p className="text-xl text-white/60">
          Select the perfect plan for your video creation needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white/5 rounded-lg p-8 flex flex-col"
          >
            <div className="flex-1">
              <h3 className="text-2xl font-light mb-2">{plan.name}</h3>
              <p className="text-4xl font-light mb-4">{plan.price}</p>
              <p className="text-white/60 mb-6">{plan.description}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant={plan.buttonVariant}
              className="w-full"
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
