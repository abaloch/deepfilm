'use client'

import { useSearchParams } from 'next/navigation';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VideoPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('videoUrl');

  return (  
    <div>
    
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
    <div className="relative w-full min-h-screen bg-black text-white">
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 space-y-4 z-10">
        
    <div className="bg-black border-2 border-black rounded-full shadow-lg p-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.80)' }}>
     <Link href="/generate">
     <HomeIcon className="w-6 h-6 text-white" />
     </Link>
   </div>
   

      </div>
      {videoUrl ? (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={videoUrl as string}
          autoPlay
          loop
          muted
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      )}
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
      </div>
    </div>
    </div>
  );
} 