'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountButton() {
  const { userId } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const fetchUserData = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/subscription-status');
      if (!response.ok) throw new Error('Failed to fetch subscription status');
      
      const data = await response.json();
      setCredits(data.credits || 0);
      setSubscriptionStatus(data.subscriptionStatus || 'inactive');
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleBillingClick = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to create portal session');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-0"
          style={{ 
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.85)' : 'white',
            color: 'black',
            borderRadius: '9999px',
            padding: '8px',
            fontSize: '16px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sparkles className="h-4 w-4" />
          {loading ? '...' : credits} Credits
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white p-0" style={{ backgroundColor: 'white', color: 'black', borderRadius: '10px', overflow: 'hidden' , border: '0px solid rgb(255, 255, 255)'}}>
        <DropdownMenuItem className="hover:bg-gray-50 bg-white" onClick={() => router.push('/subscribe')}>
          <div className="flex flex-col p-4 w-full">
            <span className="text-gray-900 font-medium" style={{ padding: '12px', fontSize: '14px' }}>Get More Credits</span>
          </div>
        </DropdownMenuItem>
        {subscriptionStatus !== 'inactive' && (
          <DropdownMenuItem className="hover:bg-gray-50 bg-white" style={{ borderTop: '1px solid rgb(229, 231, 235)' }} onClick={handleBillingClick}>
            <span className="text-gray-900 font-medium p-4 w-full" style={{ padding: '12px', fontSize: '14px' }}>Manage Subscription</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 