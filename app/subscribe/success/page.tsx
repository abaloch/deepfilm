'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, userId, isLoaded } = useAuth();

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) {
      return;
    }

    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    if (!isSignedIn || !userId) {
      // If not signed in, redirect to sign in page
      router.push('/sign-in?redirect_url=/subscribe/success?session_id=' + sessionId);
      return;
    }

    const updateSubscription = async () => {
      try {
        console.log('Updating subscription for session:', sessionId);
        
        const response = await fetch('/api/update-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Update subscription failed:', data);
          throw new Error(data.error || 'Failed to update subscription');
        }

        console.log('Subscription updated successfully:', data);

        // Use router.push instead of window.location for a smoother transition
        router.push('/generate');
      } catch (err: any) {
        console.error('Error updating subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    updateSubscription();
  }, [searchParams, router, isSignedIn, userId, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Processing your subscription...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return null;
} 