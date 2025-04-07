'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface PricingTableProps {
  onClick?: () => void;
}

export default function PricingTable({ onClick }: PricingTableProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push('/subscribe');
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto mb-20">
      <div className="grid grid-cols-1 gap-8">
        {/* Storyteller Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4">Storyteller</h3>
          <div className="text-4xl font-bold mb-6">$15<span className="text-lg text-white/60">/month</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              6 credits per month
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Additional credits available for purchase
            </li>
          </ul>
          {isSignedIn ? (
            <Button
              onClick={handleClick}
              className="w-full bg-white text-black hover:bg-white/90 rounded-full py-6 text-lg"
            >
              Subscribe
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full py-6 text-lg">
                Subscribe
              </Button>
            </SignInButton>
          )}
        </motion.div>
      </div>
    </div>
  );
}
