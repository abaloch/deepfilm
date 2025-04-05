import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { useCredits, canGenerateVideo } from '@/lib/credits';

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

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if user can generate a video
    const { canGenerate, message } = await canGenerateVideo(userId);
    if (!canGenerate) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 