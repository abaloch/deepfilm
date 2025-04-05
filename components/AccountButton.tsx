'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function AccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<{
    credits: number;
    subscription_status: string;
  } | null>(null);
  const { userId } = useAuth();

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/get-session');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  const handleBillingClick = () => {
    window.location.href = '/billing';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
      >
        <span className="text-sm font-light">Account</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-black border border-white/10 rounded-lg shadow-lg py-2"
        >
          {userData && (
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-sm text-white/60">Credits: {userData.credits}</p>
              <p className="text-sm text-white/60">
                Plan: {userData.subscription_status}
              </p>
            </div>
          )}
          <button
            onClick={handleBillingClick}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Billing
          </button>
        </motion.div>
      )}
    </div>
  );
} 