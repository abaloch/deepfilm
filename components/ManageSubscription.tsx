'use client';

import { useState } from 'react';

interface ManageSubscriptionProps {
  isActive: boolean;
}

export default function ManageSubscription({ isActive }: ManageSubscriptionProps) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        console.error('Error:', data.error);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light tracking-wider">SUBSCRIPTION</h2>
        <div className="px-3 py-1 rounded border border-white/20">
          <span className="text-sm tracking-wider">
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
      
      <button
        onClick={openPortal}
        disabled={loading}
        className="w-full bg-white text-black py-3 font-light tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'LOADING...' : 'MANAGE SUBSCRIPTION'}
      </button>
      
      <p className="mt-4 text-sm text-white/60 tracking-wide text-center">
        Manage your subscription, payment methods, and billing information
      </p>
    </div>
  );
} 