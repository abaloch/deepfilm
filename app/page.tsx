'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/generate');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl font-light tracking-wider mb-6">
              Create Stunning Videos
              <br />
              with AI
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Transform your ideas into professional videos in minutes
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => router.push('/generate')}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-8">About DeepFilm</h2>
          <div className="space-y-6 text-lg text-white/80">
            <p>
              DeepFilm is revolutionizing the way videos are created. Our platform
              leverages cutting-edge AI technology to democratize filmmaking,
              making it accessible to everyone.
            </p>
            <p>
              Whether you&apos;re a content creator, marketer, or business owner,
              DeepFilm empowers you to produce high-quality videos without the
              need for expensive equipment or technical expertise.
            </p>
            <p>
              Our mission is to break down the barriers to professional video
              production, enabling anyone to bring their creative vision to life
              with just a few clicks.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-white/60">
        <p>Founded by Asad Baloch</p>
      </div>
    </div>
  );
}

