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
    const type = url.searchParams.get('type'); // 'trending' or 'channel'
    const channelId = url.searchParams.get('channelId');
    const parentUrl = url.searchParams.get('parentUrl');
    const cursor = url.searchParams.get('cursor');
    const limit = url.searchParams.get('limit');

    const client = getNeynarClient(apiKey);
    
    // If type is trending, use trending feed
    if (type === 'trending') {
      const data = await client.getTrendingFeed({
        cursor: cursor || undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return ExpoResponse.json(data);
    }
    
    // Otherwise, use channel feed
    const data = await client.getChannelFeed({
      channel_id: channelId || undefined,
      parent_url: parentUrl || undefined,
      cursor: cursor || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('Channel API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to fetch channel feed' },
      { status: error.statusCode || 500 }
    );
  }
}

