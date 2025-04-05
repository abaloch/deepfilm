'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-4xl font-bold mb-6">Thank You!</h1>
        <p className="text-xl mb-8">
          Your subscription has been successfully processed. You can now start creating amazing videos with DeepFilm.
        </p>
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium"
            >
              Sign In to Start Creating
            </motion.button>
          </SignInButton>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium"
            onClick={() => router.push('/generate')}
          >
            Start Creating
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 