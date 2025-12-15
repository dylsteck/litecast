import { ExpoRequest, ExpoResponse } from 'expo-router/server';
import { getNeynarClient } from '../../lib/neynar/client';

export async function GET(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
    
    if (!apiKey) {
      return ExpoResponse.json(
        { error: 'Neynar API key not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!hash) {
      return ExpoResponse.json(
        { error: 'hash parameter is required' },
        { status: 400 }
      );
    }

    const client = getNeynarClient(apiKey);
    const data = await client.getThread({ hash });

    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('Thread API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to fetch thread' },
      { status: error.statusCode || 500 }
    );
  }
}

