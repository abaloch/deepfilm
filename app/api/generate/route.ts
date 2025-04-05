import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { useCredits, canGenerateVideo } from '@/lib/credits';
import { getCredits, updateCredits } from '@/lib/credits';

const STABILITY_AI_KEY = process.env.NEXT_PUBLIC_STABILITY_AI_KEY || process.env.STABILITY_AI_KEY;
const RUNWAYML_KEY = process.env.RUNWAYML_KEY;

// Debug logging for environment variables
console.log('Environment check:', {
  hasStabilityKey: !!STABILITY_AI_KEY,
  hasRunwayKey: !!RUNWAYML_KEY,
  nodeEnv: process.env.NODE_ENV
});

if (!STABILITY_AI_KEY || !RUNWAYML_KEY) {
  console.error('Missing API keys:', {
    stabilityKey: STABILITY_AI_KEY?.slice(0, 5),
    runwayKey: RUNWAYML_KEY?.slice(0, 5)
  });
  throw new Error('Missing required API keys in environment variables');
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current credits
    const { credits, subscription_status } = await getCredits(userId);

    // Check if user has sufficient credits and active subscription
    if (credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your subscription.' },
        { status: 403 }
      );
    }

    if (subscription_status !== 'active' && subscription_status !== 'trialing') {
      return NextResponse.json(
        { error: 'Your subscription is not active. Please check your subscription status.' },
        { status: 403 }
      );
    }

    // Deduct one credit
    await updateCredits(userId, credits - 1);

    // Generate video using Runway
    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate video');
    }

    const data = await response.json();
    
    // Deduct credits after successful generation
    const updatedUser = await useCredits(userId);

    return NextResponse.json({ 
      videoUrl: data.videoUrl,
      remainingCredits: updatedUser.credits,
      subscriptionStatus: updatedUser.subscription_status
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[GENERATE_ERROR]', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 