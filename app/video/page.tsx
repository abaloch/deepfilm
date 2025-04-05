'use client'

import { useSearchParams } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Suspense } from 'react';

function VideoContent() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('videoUrl');

  return (  
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/generate" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <HomeIcon className="w-5 h-5" />
            <span>Back to Generate</span>
          </Link>
          <span className="text-xl font-medium tracking-tight">DEEPFILM</span>
        </header>

        {/* Video Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/30">
          {videoUrl ? (
            <video
              className="w-full h-full object-cover"
              src={videoUrl as string}
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoContent />
    </Suspense>
  );
} 