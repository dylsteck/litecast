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
    const fid = url.searchParams.get('fid');
    const cursor = url.searchParams.get('cursor');
    const limit = url.searchParams.get('limit');

    if (!fid) {
      return ExpoResponse.json(
        { error: 'fid parameter is required' },
        { status: 400 }
      );
    }

    const client = getNeynarClient(apiKey);
    const data = await client.getFeed({
      fid: parseInt(fid, 10),
      cursor: cursor || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('Feed API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: error.statusCode || 500 }
    );
  }
}

