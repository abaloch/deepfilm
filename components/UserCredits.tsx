'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getRemainingCredits } from '@/lib/credits';

export default function UserCredits() {
  const { userId } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      if (!userId) return;
      
      try {
        const { credits: remainingCredits, subscriptionStatus: status } = await getRemainingCredits(userId);
        setCredits(remainingCredits);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
  }, [userId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading credits...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="font-medium">{credits}</span> credits remaining
      </div>
      <div className="text-sm">
        Status: <span className={`font-medium ${
          subscriptionStatus === 'active' ? 'text-green-500' :
          subscriptionStatus === 'trialing' ? 'text-blue-500' :
          'text-red-500'
        }`}>
          {subscriptionStatus}
        </span>
      </div>
    </div>
  );
} 