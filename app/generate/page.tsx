"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function Generate() {
  const router = useRouter();
  const { userId } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState('/beautiful-woman-closeup.mp4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsGenerating(true);

    try {
      // First call your API to check credits and generate video
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      // Update credits immediately
      setCredits(data.credits);

      // Dispatch event to update credits in UI
      const event = new CustomEvent('creditsUpdated', {
        detail: {
          credits: data.credits,
          subscriptionStatus: data.subscriptionStatus
        }
      });
      console.log('Dispatching creditsUpdated event:', event.detail);
      window.dispatchEvent(event);

      // If API call succeeds, proceed with video generation
      const stabilityAiKey = process.env.NEXT_PUBLIC_STABILITY_AI_KEY;
      const runwaymlKey = process.env.NEXT_PUBLIC_RUNWAYML_KEY;
      
      const videoRes = await fetch('https://deepfilm-615767718304.us-west2.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          stability_ai_key: stabilityAiKey,
          runwayml_key: runwaymlKey
        }),
      });

      if (!videoRes.ok) {
        const errorText = await videoRes.text();
        throw new Error(`Failed to generate video: ${errorText}`);
      }

      const videoData = await videoRes.json();
      
      if (videoData.video_url) {
        // Update the video source instead of navigating
        setCurrentVideo(videoData.video_url);
        setPrompt(''); // Clear the prompt
      } else {
        throw new Error('No video URL received');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Main container */}
      <div className="max-w-[1200px] mx-auto" style={{ marginTop: '80px' }}>
        {/* Error Notification */}
        {error && (
          <div style={{ 
            width: '800px',
            maxWidth: '90%',
            margin: '0 auto 32px auto'
          }}>
            <div style={{ 
              background: 'white',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              color: 'black',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>You don't have enough credits to generate a video. Please buy more credits to continue.</span>
            </div>
          </div>
        )}

        {/* Video Section */}
        <div className="max-w-[800px] mx-auto my-20">
          <div className="relative w-full h-[450px]">
            {!isGenerating ? (
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
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/80 rounded-lg"
                   style={{ 
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                     border: '1px solid rgba(128, 128, 128, 0.3)'
                   }}>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="spinner"></div>
                  <span className="text-white text-lg font-medium">Generating your video...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-[800px] mx-auto" style={{ marginTop: '80px' }}>
          <form onSubmit={handleSubmit} id="videoForm" className="w-full">
            <div className="flex w-full items-center relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full text-white focus:outline-none rounded-full pr-20 text-lg"
                placeholder="Write your imagination..."
                required
                style={{ 
                  resize: 'none',
                  lineHeight: '28px',
                  padding: '10px 24px',
                  color: 'white',
                  fontSize: '18px',
                  background: 'rgba(192, 192, 192, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              ></textarea>
              <div className="ml-[-60px]">
                <button 
                  type="submit" 
                  className="rounded-full flex items-center justify-center text-sm text-white"
                  disabled={loading}
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {loading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }

        .spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
          line-height: 28px;
          position: relative;
          top: 1px;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
