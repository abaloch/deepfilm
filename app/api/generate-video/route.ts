// pages/api/generate-video.js
import { GoogleAuth } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_PROJECT_ID) {
      console.error('Missing environment variables:', {
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasProjectId: !!process.env.GOOGLE_PROJECT_ID
      });
      return NextResponse.json({ error: 'Missing required environment variables' }, { status: 500 });
    }

    // Create an auth client
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Get the access token
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    // Forward the request to Cloud Run
    const response = await fetch('https://deepfilm-615767718304.us-west2.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloud Run error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries()),
        requestBody: requestBody
      });
      return NextResponse.json({ error: 'Cloud Run service error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}