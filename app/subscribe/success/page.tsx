'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Handle successful subscription
      console.log('Subscription successful:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light mb-4">Thank You!</h1>
        <p className="text-xl text-white/60 mb-8">
          Your subscription has been confirmed.
        </p>
        <p className="text-white/60">
          You can now start generating videos with your new credits.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 