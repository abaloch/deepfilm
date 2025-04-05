import { useState, useEffect } from 'react';

interface SubscriptionData {
  hasSubscription: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription(): SubscriptionData {
  const [data, setData] = useState<SubscriptionData>({
    hasSubscription: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription-status');
        const result = await response.json();
        
        if (result.error) {
          setData({
            hasSubscription: false,
            isLoading: false,
            error: result.error
          });
          return;
        }

        setData({
          hasSubscription: result.hasSubscription,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setData({
          hasSubscription: false,
          isLoading: false,
          error: 'Failed to check subscription status'
        });
      }
    };

    checkSubscription();
  }, []);

  return data;
} 