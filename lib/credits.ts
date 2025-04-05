'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const CREDITS_PER_MONTH = {
  basic: 10,
  pro: 50,
  enterprise: 200
};

export const PRICE_IDS = {
  basic: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY',
  pro: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY',
  enterprise: 'price_1R9ZdBPfnvEhFMZfpu6G5mvY'
};

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface UserCredits {
  credits: number;
  subscriptionStatus: SubscriptionStatus;
}

// Server-side functions
export async function getCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('credits, subscription_status')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching credits:', error);
    return { credits: 0, subscriptionStatus: 'incomplete' };
  }

  return {
    credits: data?.credits || 0,
    subscriptionStatus: data?.subscription_status || 'incomplete'
  };
}

export async function updateCredits(userId: string, newCredits: number): Promise<void> {
  const { error } = await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating credits:', error);
    throw new Error('Failed to update credits');
  }
}

export async function initializeUserCredits(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: 5, // Initial free credits
        subscription_status: 'incomplete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error initializing credits:', error);
      throw new Error('Failed to initialize credits');
    }
  } catch (error) {
    console.error('Error in initializeUserCredits:', error);
    throw error;
  }
}

export async function updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_credits')
      .update({ subscription_status: status })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('Failed to update subscription status');
    }
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    throw error;
  }
}

// Client-side hook
export function useCredits() {
  const { userId } = useAuth();
  const [credits, setCredits] = useState<UserCredits>({ credits: 0, subscriptionStatus: 'incomplete' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (!userId) return;

      try {
        const response = await fetch('/api/credits');
        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }
        const data = await response.json();
        setCredits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCredits();
  }, [userId]);

  const deductCredits = async (amount: number) => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to deduct credits');
      }

      const data = await response.json();
      setCredits(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  return {
    credits: credits.credits,
    subscriptionStatus: credits.subscriptionStatus,
    isLoading,
    error,
    deductCredits,
  };
}

export async function getRemainingCredits(clerkId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('credits, subscription_status')
    .eq('clerk_id', clerkId)
    .single();

  return {
    credits: user?.credits ?? 0,
    subscriptionStatus: user?.subscription_status ?? 'inactive'
  };
}

export async function addCredits(clerkId: string, amount: number) {
  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const { data: updatedUser } = await supabase
    .from('users')
    .update({ credits: user.credits + amount })
    .eq('clerk_id', clerkId)
    .select()
    .single();

  return updatedUser;
}

export async function canGenerateVideo(clerkId: string): Promise<{ canGenerate: boolean; message?: string }> {
  const { data: user } = await supabase
    .from('users')
    .select('credits, subscription_status')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) {
    return { canGenerate: false, message: 'User not found' };
  }

  if (user.credits < 1) {
    return { canGenerate: false, message: 'Insufficient credits. Please upgrade your subscription to generate more videos.' };
  }

  if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
    return { canGenerate: false, message: 'Your subscription is not active. Please check your subscription status.' };
  }

  return { canGenerate: true };
} 