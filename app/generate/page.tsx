"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';


export default function Generate() {
    const router = useRouter();

    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
          const res = await fetch('http://127.0.0.1:5000/generate-video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });
    
          const data = await res.json();
          if (data.video_url) {
            // Navigate to the new page with the video URL
            router.push(`/video?videoUrl=${encodeURIComponent(data.video_url)}`);
          } else {
            console.error('Error:', data.error);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

  return (
    <div className="relative w-full min-h-screen bg-black text-white">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/beautiful-woman-closeup.mp4"  // Ensure this path matches your file name
        autoPlay
        loop
        muted
      ></video>

      <div className="relative z-10">
        <header className=" py-6 px-4 flex items-center">
          <div className="flex items-center">
            <span className="text-xl font-medium tracking-tight">DEEPFILM</span>
          </div>
          <div className="flex-grow">
            </div> 

          <div className="ml-auto flex items-center">
    <UserIcon className="w-6 h-6 text-white cursor-pointer bg-black border-2  shadow-lg border-black rounded-full" style={{ width: '40px', height: '40px', padding: '4px', backgroundColor: 'rgba(0, 0, 0, 0.80)' }} />
  </div>
        </header>
      
        <div className="w-full flex items-center justify-center min-h-screen">
          <div
            className="input-section mx-auto w-1/3 shadow-lg rounded-3xl border-2 px-5 py-5 border-black border-opacity-25"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.80)' }} // 50% opacity
          >
            <form onSubmit={handleSubmit} id="videoForm" className="flex flex-col items-center">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4 p-1 text-white w-full focus:outline-none"
                placeholder="Write your imagination..."
                required
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.0)' }}
              ></textarea>
              <button type="submit" className="bg-white text-black rounded-full py-2 px-4 hover:bg-gray-200 flex items-center justify-center  " style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // 80% opacity
          color: 'white',
        }} >
                {loading ? (
                  <div className="spinner border-t-2 border-white rounded-full w-4 h-4"></div>
                ) : (
                  'Generate'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
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
