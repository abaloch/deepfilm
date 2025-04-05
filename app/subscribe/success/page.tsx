'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      console.error('No session ID found');
      return;
    }

    // Redirect to generate page after a short delay
    const timer = setTimeout(() => {
      router.push('/generate');
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-2 border-white mx-auto mb-4"></div>
          <h1 className="text-4xl font-light tracking-wider text-white mb-2">SUCCESS</h1>
          <p className="text-white/60 text-sm tracking-widest">REDIRECTING</p>
        </div>
      </div>
    </div>
  );
} 