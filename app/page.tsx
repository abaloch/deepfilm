'use client';

import { SignInButton, SignedOut, UserButton, SignedIn} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video play failed:", error);
      });
    }
  }, []);

  return (
    <div className=" bg-black min-h-screen text-white flex flex-col">
      {/* Header */}
      

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-20">
        <h1 className="text-5xl md:text-5xl sm:text-5xl leading-[1.1] font-medium tracking-tight max-w-4xl">Text to Video AI</h1>
        <p className="text-xl text-gray-400 mt-4 mb-8 max-w-2xl">
          Coming soon
        </p>

        {/* Video Section */}
        <div className="relative w-full min-h-screen ">
          <video 
            ref={videoRef}
            src="/beautiful-woman-closeup.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover rounded-3xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-16 mt-20 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Currently</span>
            </div>
            <div className="space-y-1 text-gray-400">
              <p>HQ :: LOS ANGELES, CA</p>
            </div>
            
            <div className="space-y-1 text-gray-400">
              <p>ACTIVE PROTOTYPE</p>
              <p>V1</p>
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-xl leading-relaxed text-gray-300">
              Founded by Asad Baloch, for the indie filmmaker.
            </p>
            
          </div>
        </div>
      </main>
    </div>
  )
}

