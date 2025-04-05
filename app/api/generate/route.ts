import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCredits, updateCredits } from '@/lib/credits';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user's credits
    const userCredits = await getCredits(userId);
    if (userCredits.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your subscription.' },
        { status: 402 }
      );
    }

    // Check subscription status
    if (userCredits.subscriptionStatus !== 'active' && userCredits.subscriptionStatus !== 'trialing') {
      return NextResponse.json(
        { error: 'Your subscription is not active. Please check your subscription status.' },
        { status: 403 }
      );
    }

    // Deduct one credit
    await updateCredits(userId, userCredits.credits - 1);

    // TODO: Implement video generation logic here
    const generatedVideo = {
      id: 'video_123',
      url: 'https://example.com/video.mp4',
      status: 'completed'
    };

    return NextResponse.json(generatedVideo);
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the video' },
      { status: 500 }
    );
  }
} 