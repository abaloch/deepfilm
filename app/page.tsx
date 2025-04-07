'use client';

import PricingTable from '@/components/PricingTable';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
// more notes added just so i can commit

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

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { userId } = useAuth();
  const router = useRouter();
  const [showSubscribeButton, setShowSubscribeButton] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video play failed:", error);
      });
    }

    // Check subscription status if user is logged in
    if (userId) {
      const checkSubscription = async () => {
        try {
          console.log('Checking subscription status for user:', userId);
          const response = await fetch('/api/subscription-status');
          if (!response.ok) {
            throw new Error(`Failed to fetch subscription status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Subscription status response:', data);
          
          if (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing') {
            console.log('User has active subscription, redirecting to /generate');
            router.push('/generate');
          } else {
            console.log('User does not have active subscription');
            setShowSubscribeButton(true);
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      };

      checkSubscription();
    }
  }, [userId, router]);

  const handlePricingClick = () => {
    if (userId) {
      router.push('/subscribe');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <div className={`bg-black min-h-screen text-white flex flex-col ${inter.className}`}>
      {/* Header */}
      

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-medium tracking-tight mx-auto text-center" 
          style={{ fontSize: '80px', lineHeight: '1', maxWidth: '800px' }}
        >
          Turn Words into Cinema
        </motion.h1>
        
        {/* Video Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-[1000px] mx-auto" 
          style={{ marginTop: '120px', marginBottom: '120px' }}
        >
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <video 
                ref={videoRef}
                src="/beautiful-woman-closeup.mp4" 
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                preload="auto"
                poster="/woman-closeup.png"
                className="w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  // If video fails to load, hide it and show the fallback image
                  const videoElement = e.currentTarget;
                  videoElement.style.display = 'none';
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </motion.div>
        
        {/* Subscribe Button for Signed-in Users */}
        {showSubscribeButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-20"
          >
            <Button
              onClick={() => router.push('/subscribe')}
              className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
              style={{
                fontSize: '18px',
                fontWeight: '500',
                padding: '20px 40px'
              }}
            >
              Subscribe to Get Started
            </Button>
          </motion.div>
        )}

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mx-auto" 
          style={{ marginTop: '120px', marginBottom: '40px' }}
        >
          <div className="rounded-[40px]" style={{ 
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '900px',
            padding: '80px 20px'
          }}>
            <h2 className="text-4xl font-semibold mb-16 text-center" style={{ fontSize: '40px' }}>How It Works</h2>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {/* Step 1 */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px',
                width: '100%',
                maxWidth: '900px',
                background: 'black',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: '24px',
                minHeight: '280px',
                marginBottom: '32px',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: '16px',
                  marginBottom: '24px',
                  flexShrink: 0
                }}>
                  <span style={{ 
                    fontSize: '20px',
                    fontWeight: '500',
                    color: 'black'
                  }}>1</span>
                </div>
                <h3 style={{ 
                  fontSize: '28px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: 'white',
                  padding: '0 8px'
                }}>Write a Prompt</h3>
                <p style={{ 
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  padding: '0 8px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Describe your vision in natural language. Be specific about scenes, actions, and style.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px',
                width: '100%',
                maxWidth: '900px',
                background: 'black',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: '24px',
                minHeight: '280px',
                marginBottom: '32px',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: '16px',
                  marginBottom: '24px',
                  flexShrink: 0
                }}>
                  <span style={{ 
                    fontSize: '20px',
                    fontWeight: '500',
                    color: 'black'
                  }}>2</span>
                </div>
                <h3 style={{ 
                  fontSize: '28px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: 'white',
                  padding: '0 16px'
                }}>Generate</h3>
                <p style={{ 
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  padding: '0 16px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Our AI transforms your description into a cinematic video, frame by frame.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px',
                width: '100%',
                maxWidth: '900px',
                background: 'black',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: '24px',
                minHeight: '280px',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: '16px',
                  marginBottom: '24px',
                  flexShrink: 0
                }}>
                  <span style={{ 
                    fontSize: '20px',
                    fontWeight: '500',
                    color: 'black'
                  }}>3</span>
                </div>
                <h3 style={{ 
                  fontSize: '28px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: 'white',
                  padding: '0 16px'
                }}>Download</h3>
                <p style={{ 
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  padding: '0 16px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Get your high-quality video, uniquely crafted and ready for your project.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why DeepFilm Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mx-auto" 
          style={{ marginTop: '40px', marginBottom: '120px', background: 'white', padding: '80px 20px', borderRadius: '40px', width: '100%', maxWidth: '900px' }}
        >
          <h2 className="text-4xl font-semibold mb-16 text-center" style={{ fontSize: '40px', color: 'black' }}>Why DEEPFILM?</h2>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '64px',
            width: '100%',
            maxWidth: '850px',
            margin: '0 auto'
          }}>
            {/* Reason 1 */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'black'
              }}>
                <a 
                  href="https://runwayml.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'black',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                    paddingBottom: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = 'rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = 'rgba(0, 0, 0, 0.2)';
                  }}
                >
                  Powered by Runway
                </a>
              </h3>
              <p style={{ 
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'rgba(0, 0, 0, 0.8)',
                maxWidth: '600px'
              }}>
                Harness the power of cutting-edge AI to transform your creative vision into stunning cinematic content.
              </p>
            </div>

            {/* Reason 2 */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77283 19.9886C9.58054 19.7199 9.31258 19.5175 9.005 19.41C8.69742 19.3025 8.36438 19.2954 8.05154 19.3899C7.7387 19.4844 7.46052 19.6759 7.255 19.94L7.195 20C7.00905 20.1857 6.78845 20.3332 6.54564 20.4339C6.30283 20.5345 6.04255 20.5863 5.78 20.5863C5.51745 20.5863 5.25717 20.5345 5.01436 20.4339C4.77155 20.3332 4.55095 20.1857 4.365 20C4.17905 19.8143 4.03155 19.5937 3.93089 19.3509C3.83024 19.1081 3.77844 18.8478 3.77844 18.5853C3.77844 18.3227 3.83024 18.0624 3.93089 17.8196C4.03155 17.5768 4.17905 17.3562 4.365 17.17L4.425 17.11C4.65554 16.8795 4.81024 16.5802 4.86904 16.2558C4.92783 15.9314 4.88811 15.5968 4.755 15.295C4.62821 14.9992 4.41777 14.747 4.14947 14.5693C3.88117 14.3916 3.56679 14.2963 3.245 14.295H3C2.46957 14.295 1.96086 14.0843 1.58579 13.7092C1.21071 13.3341 1 12.8254 1 12.295C1 11.7646 1.21071 11.2559 1.58579 10.8808C1.96086 10.5057 2.46957 10.295 3 10.295H3.09C3.42099 10.2873 3.74272 10.1801 4.01141 9.98783C4.28011 9.79554 4.48253 9.52758 4.59 9.22C4.69747 8.91242 4.70457 8.57938 4.61006 8.26654C4.51555 7.9537 4.32405 7.67552 4.06 7.47L4 7.41C3.81428 7.22405 3.66677 7.00345 3.56612 6.76064C3.46547 6.51783 3.41367 6.25755 3.41367 5.995C3.41367 5.73245 3.46547 5.47217 3.56612 5.22936C3.66677 4.98655 3.81428 4.76595 4 4.58C4.18572 4.39405 4.40632 4.24655 4.64914 4.14589C4.89195 4.04524 5.15223 3.99344 5.41478 3.99344C5.67733 3.99344 5.93761 4.04524 6.18042 4.14589C6.42323 4.24655 6.64383 4.39405 6.82961 4.58L6.88961 4.64C7.12015 4.87054 7.41947 5.02524 7.74387 5.08404C8.06827 5.14283 8.40285 5.10311 8.70461 4.97C9.00037 4.84321 9.25261 4.63277 9.43031 4.36447C9.60801 4.09617 9.70331 3.78179 9.70461 3.46V3.41C9.70461 2.87957 9.91532 2.37086 10.2904 1.99579C10.6655 1.62071 11.1742 1.41 11.7046 1.41C12.235 1.41 12.7437 1.62071 13.1188 1.99579C13.4939 2.37086 13.7046 2.87957 13.7046 3.41V3.5C13.7069 3.82179 13.8022 4.13617 13.9799 4.40447C14.1576 4.67277 14.4098 4.88321 14.7056 5.01C15.0074 5.14311 15.342 5.18283 15.6664 5.12404C15.9908 5.06524 16.2901 4.91054 16.5206 4.68L16.5806 4.62C16.7666 4.43428 16.9872 4.28677 17.23 4.18612C17.4728 4.08547 17.7331 4.03367 17.9956 4.03367C18.2582 4.03367 18.5185 4.08547 18.7613 4.18612C19.0041 4.28677 19.2247 4.43428 19.4106 4.62C19.5966 4.80572 19.7441 5.02632 19.8447 5.26914C19.9454 5.51195 19.9972 5.77223 19.9972 6.03478C19.9972 6.29733 19.9454 6.55761 19.8447 6.80042C19.7441 7.04323 19.5966 7.26383 19.4106 7.44961L19.3506 7.50961C19.1201 7.74015 18.9654 8.03947 18.9066 8.36387C18.8478 8.68827 18.8875 9.02285 19.0206 9.32461V9.32461Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'black'
              }}>Professional Quality</h3>
              <p style={{ 
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'rgba(0, 0, 0, 0.8)',
                maxWidth: '600px'
              }}>
                Get high-quality, cinematic videos without– expensive equipment or production teams.
              </p>
            </div>

            {/* Reason 3 */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'black'
              }}>Built for Visionaries</h3>
              <p style={{ 
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'rgba(0, 0, 0, 0.8)',
                maxWidth: '600px'
              }}>
                DEEPFILM is designed for storytellers, dreamers, and indie creators–those with a vision but not always the tools
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Separator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ 
            width: '100%',
            maxWidth: '900px',
            margin: '120px auto',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)',
            position: 'relative'
          }}
        >
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%'
          }}></div>
        </motion.div>

        {/* About Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mx-auto" 
          style={{ marginTop: '120px', marginBottom: '120px' }}
        >
          <h2 className="text-4xl font-semibold mb-16 text-center" style={{ fontSize: '40px' }}>About</h2>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '64px',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ 
                fontSize: '24px',
                lineHeight: '1.4',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '32px',
                maxWidth: '800px'
              }}>
                DEEPFILM is a new kind of filmmaking platform, built for the next generation of storytellers. We're reimagining how films are made, one frame at a time.
              </p>
              <p style={{ 
                fontSize: '20px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '800px',
                marginBottom: '10px'
              }}>
                Founded in 2025, we're on a mission to democratize filmmaking through artificial intelligence. Our platform combines cutting-edge technology with artistic vision, enabling creators to bring their stories to life in ways never before possible.
              </p>
              
            </div>

            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px'
            }}>
              <span style={{ 
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>Founded by Asad Baloch</span>
            </div>
          </div>
          
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mx-auto" 
          style={{ marginTop: '120px', marginBottom: '120px', background: 'white', padding: '80px 20px', borderRadius: '40px', width: '100%', maxWidth: '900px' }}
        >
          <h2 className="text-4xl font-semibold mb-16 text-center" style={{ fontSize: '40px', color: 'black' }}>Start Creating</h2>
          <div style={{ 
            width: '100%',
            maxWidth: '850px',
            background: 'black',
            padding: '40px 40px 20px 40px',
            borderRadius: '24px',
            margin: '0 auto'
          }}>
            <PricingTable onClick={handlePricingClick} />
          </div>
        </motion.div>
      </main>
    </div>
  )
}

