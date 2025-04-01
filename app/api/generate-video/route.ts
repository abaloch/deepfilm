// pages/api/generate-video.js
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { prompt } = requestBody;

    // Get API keys from environment variables
    const stabilityAiKey = process.env.STABILITY_AI_KEY;
    const runwaymlKey = process.env.RUNWAYML_KEY;

    if (!stabilityAiKey || !runwaymlKey) {
      return NextResponse.json({ error: 'API keys are missing in environment variables' }, { status: 400 });
    }

    // URL of your Google Cloud Function
    const url = 'https://deepfilm-615767718304.us-west2.run.app';

    // Prepare the request payload
    const payload = {
      prompt,
      stability_ai_key: stabilityAiKey,
      runwayml_key: runwaymlKey
    };

    // Make the POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to call Cloud Function:', errorText);
      return NextResponse.json({ error: 'Failed to call Cloud Function' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}