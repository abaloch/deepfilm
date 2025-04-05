'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function ManageSubscription() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const createPortalSession = async () => {
      try {
        const response = await fetch('/api/create-portal-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.url) {
          throw new Error('No URL returned from portal session creation');
        }

        window.location.href = data.url;
      } catch (error) {
        console.error('Error:', error);
        // You might want to show an error message to the user here
      }
    };

    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else {
        createPortalSession();
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
} 