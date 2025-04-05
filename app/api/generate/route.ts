import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { useCredits, canGenerateVideo } from '@/lib/credits';

const STABILITY_AI_KEY = process.env.NEXT_PUBLIC_STABILITY_AI_KEY || process.env.STABILITY_AI_KEY;
const RUNWAYML_KEY = process.env.NEXT_PUBLIC_RUNWAYML_KEY || process.env.RUNWAYML_KEY;

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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the prompt from the request body
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if user can generate a video
    const { canGenerate, message } = await canGenerateVideo(userId);
    if (!canGenerate) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    const requestBody = {
      prompt,
      stability_ai_key: STABILITY_AI_KEY,
      runwayml_key: RUNWAYML_KEY
    };

    // Log the request being sent (with partial key values for security)
    console.log('Sending request to Cloud Run:', {
      prompt,
      stability_ai_key_length: requestBody.stability_ai_key?.length,
      stability_ai_key_start: requestBody.stability_ai_key?.slice(0, 5),
      runwayml_key_length: requestBody.runwayml_key?.length,
      runwayml_key_start: requestBody.runwayml_key?.slice(0, 5)
    });

    // Call the Cloud Run function to generate the video
    const response = await fetch('https://deepfilm-615767718304.us-west2.run.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Cloud Run response text:', responseText);

    if (!response.ok) {
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { error: responseText };
      }
      console.error('Cloud Run error response:', error);
      throw new Error(error.error || 'Failed to generate video');
    }

    const data = JSON.parse(responseText);

    // Only deduct credits if video generation was successful
    try {
      const updatedUser = await useCredits(userId);
      return NextResponse.json({
        ...data,
        credits: updatedUser.credits,
        subscriptionStatus: updatedUser.subscription_status
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in video generation:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 