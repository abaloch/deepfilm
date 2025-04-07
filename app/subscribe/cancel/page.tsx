'use client';

import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-2 border-red-500 mx-auto mb-4"></div>
          <h1 className="text-4xl font-light tracking-wider text-white mb-2">PAYMENT CANCELLED</h1>
          <p className="text-white/60 text-sm tracking-widest">You can try again</p>
        </div>
        <button
          onClick={() => router.push('/subscribe')}
          className="bg-white text-black py-3 px-6 rounded-full font-medium hover:bg-white/90 transition-colors"
        >
          Return to Subscribe
        </button>
      </div>
    </div>
  );
} 