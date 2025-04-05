'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PricingTable from '@/components/PricingTable';
import { Inter } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
      };
    }
  }
}

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-light">DEEPFILM</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-white/80">
              Sign In
            </Button>
            <Button className="bg-white text-black hover:bg-white/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl font-light mb-8">
              Transform Your Words into Cinematic Video
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Create stunning videos from text prompts using the power of AI. No cameras, no crew, just your imagination.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Video Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-lg shadow-2xl"
              style={{ maxHeight: '600px', objectFit: 'cover' }}
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-light mb-12 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-2">Write Your Story</h3>
                <p className="text-white/60">
                  Describe your vision in words. Our AI understands your creative intent.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-2">AI Generates Video</h3>
                <p className="text-white/60">
                  Our advanced AI transforms your words into stunning visual sequences.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-2">Share Your Creation</h3>
                <p className="text-white/60">
                  Download and share your AI-generated masterpiece with the world.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-20 text-center"
      >
        <h1 className="text-4xl font-light tracking-wider mb-8">About</h1>
        <div className="space-y-8">
          <p style={{ 
            fontSize: '24px', 
            lineHeight: '1.6', 
            color: 'white',
            letterSpacing: '0.5px',
            maxWidth: '800px',
            margin: '0 auto'
          }} className="font-light">
            DEEPFILM is an AI-powered storytelling tool that transforms written prompts into cinematic video.
          </p>
          <p style={{ 
            fontSize: '24px', 
            lineHeight: '1.6', 
            color: 'white',
            letterSpacing: '0.5px',
            maxWidth: '800px',
            margin: '0 auto'
          }} className="font-light">
            Built for indie filmmakers and creative visionaries, it blends intuitive technology with a deep love for film, aesthetics, and emotional storytelling.
          </p>
          <p style={{ 
            fontSize: '24px', 
            lineHeight: '1.6', 
            color: 'white',
            letterSpacing: '0.5px',
            maxWidth: '800px',
            margin: '0 auto'
          }} className="font-light">
            DEEPFILM exists to make visual storytelling more intuitive, expressive, and accessible — no cameras, no crew, just imagination.
          </p>
          <p style={{ 
            fontSize: '24px', 
            lineHeight: '1.6', 
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.5px',
            maxWidth: '800px',
            margin: '0 auto'
          }} className="font-light">
            Founded by Asad Baloch
          </p>
        </div>
      </motion.div>
    </div>
  );
}

