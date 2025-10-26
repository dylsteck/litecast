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
    const username = url.searchParams.get('username');

    if (!fid && !username) {
      return ExpoResponse.json(
        { error: 'Either fid or username parameter is required' },
        { status: 400 }
      );
    }

    const client = getNeynarClient(apiKey);
    
    let data;
    if (fid) {
      data = await client.getUserProfile(parseInt(fid, 10));
    } else if (username) {
      data = await client.getUserByUsername(username);
    }

    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('User API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: error.statusCode || 500 }
    );
  }
}

