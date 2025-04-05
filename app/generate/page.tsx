"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const VIDEO_URLS = [
  '/videos/1.mp4',
  '/videos/2.mp4',
  '/videos/3.mp4',
  '/videos/4.mp4',
  '/videos/5.mp4',
  '/videos/6.mp4',
  '/videos/7.mp4',
  '/videos/8.mp4',
  '/videos/9.mp4',
  '/videos/10.mp4',
  '/videos/11.mp4',
  '/videos/12.mp4',
  '/videos/13.mp4',
  '/videos/14.mp4',
  '/videos/15.mp4',
  '/videos/16.mp4',
  '/videos/17.mp4',
  '/videos/18.mp4',
  '/videos/19.mp4',
  '/videos/20.mp4',
  '/videos/21.mp4',
  '/videos/22.mp4',
  '/videos/23.mp4',
  '/videos/24.mp4',
  '/videos/25.mp4',
  '/videos/26.mp4',
  '/videos/27.mp4',
  '/videos/28.mp4',
  '/videos/29.mp4',
  '/videos/30.mp4',
  '/videos/31.mp4',
  '/videos/32.mp4',
  '/videos/33.mp4',
  '/videos/34.mp4',
  '/videos/35.mp4',
  '/videos/36.mp4',
  '/videos/37.mp4',
  '/videos/38.mp4',
  '/videos/39.mp4',
  '/videos/40.mp4',
  '/videos/41.mp4',
  '/videos/42.mp4',
  '/videos/43.mp4',
  '/videos/44.mp4',
  '/videos/45.mp4',
  '/videos/46.mp4',
  '/videos/47.mp4',
  '/videos/48.mp4',
  '/videos/49.mp4',
  '/videos/50.mp4',
  '/videos/51.mp4',
  '/videos/52.mp4',
  '/videos/53.mp4',
  '/videos/54.mp4',
  '/videos/55.mp4',
  '/videos/56.mp4',
  '/videos/57.mp4',
  '/videos/58.mp4',
  '/videos/59.mp4',
  '/videos/60.mp4',
  '/videos/61.mp4',
  '/videos/62.mp4',
  '/videos/63.mp4',
  '/videos/64.mp4',
  '/videos/65.mp4',
  '/videos/66.mp4',
  '/videos/67.mp4',
  '/videos/68.mp4',
  '/videos/69.mp4',
  '/videos/70.mp4',
  '/videos/71.mp4',
  '/videos/72.mp4',
  '/videos/73.mp4',
  '/videos/74.mp4',
  '/videos/75.mp4',
  '/videos/76.mp4',
  '/videos/77.mp4',
  '/videos/78.mp4',
  '/videos/79.mp4',
  '/videos/80.mp4',
  '/videos/81.mp4',
  '/videos/82.mp4',
  '/videos/83.mp4',
  '/videos/84.mp4',
  '/videos/85.mp4',
  '/videos/86.mp4',
  '/videos/87.mp4',
  '/videos/88.mp4',
  '/videos/89.mp4',
  '/videos/90.mp4',
  '/videos/91.mp4',
  '/videos/92.mp4',
  '/videos/93.mp4',
  '/videos/94.mp4',
  '/videos/95.mp4',
  '/videos/96.mp4',
  '/videos/97.mp4',
  '/videos/98.mp4',
  '/videos/99.mp4',
  '/videos/100.mp4'
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState(VIDEO_URLS[0]);
  const [videoIndex, setVideoIndex] = useState(0);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_URLS.length);
      setCurrentVideo(VIDEO_URLS[videoIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [videoIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setError('Please sign in to generate videos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate video');
      }

      const data = await response.json();
      setCurrentVideo(data.videoUrl);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light tracking-wider mb-8"
        >
          GENERATE
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-light mb-2">
                  PROMPT
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/20"
                  rows={4}
                  placeholder="Describe your video..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-light tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'GENERATING...' : 'GENERATE'}
              </button>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-video bg-white/5 rounded-lg overflow-hidden"
          >
            <video 
              key={currentVideo}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              src={currentVideo}
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="auto"
              style={{ 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(128, 128, 128, 0.3)',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            ></video>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
