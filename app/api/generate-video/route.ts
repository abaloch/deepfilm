// pages/api/generate-video.js
import { GoogleAuth, Credentials } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

interface ExternalAccountCredentials extends Credentials {
  type: string;
  audience: string;
  subject_token_type: string;
  token_url: string;
  service_account_impersonation_url: string;
  credential_source: {
    file: string;
    format: {
      type: string;
      subject_token_field_name: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.WORKLOAD_IDENTITY_PROVIDER) {
      return NextResponse.json({ 
        error: 'Missing Workload Identity Provider configuration',
        details: 'Please check environment variables'
      }, { status: 500 });
    }

    // Create an auth client using Workload Identity Federation
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      clientOptions: {
        projectId: 'planar-courage-368523',
        credentials: {
          type: 'external_account',
          audience: process.env.WORKLOAD_IDENTITY_PROVIDER,
          subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
          token_url: 'https://sts.googleapis.com/v1/token',
          service_account_impersonation_url: 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/deepfilm-vercel-sa@planar-courage-368523.iam.gserviceaccount.com:generateAccessToken',
          credential_source: {
            file: '.token.value',
            format: {
              type: 'json',
              subject_token_field_name: 'access_token'
            }
          }
        } as ExternalAccountCredentials
      }
    });

    // Get the access token
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token.token) {
      throw new Error('Failed to generate access token');
    }

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    // Forward the request to Cloud Run
    const response = await fetch('https://deepfilm-34hzw7pykq-wl.a.run.app', {
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
        body: errorText
      });
      return NextResponse.json({ error: 'Cloud Run service error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}