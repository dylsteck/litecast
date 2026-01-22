import { useInfiniteQuery } from '@tanstack/react-query';
import { NeynarFeedResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchChannelFeed(
  type: 'trending' | 'channel',
  parentUrl?: string,
  channelId?: string,
  cursor?: string
): Promise<NeynarFeedResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Neynar API key not configured');
    throw new Error('Neynar API key not configured');
  }

  let endpoint = NEYNAR_ENDPOINTS.FEED_TRENDING;
  
  // Trending feed has a limit of 1-10, other feeds can use 25
  const limit = type === 'trending' ? '10' : '25';
  
  const params = new URLSearchParams({
    limit: limit,
  });
  
  if (cursor) {
    params.append('cursor', cursor);
  }
  
  if (type === 'channel') {
    endpoint = NEYNAR_ENDPOINTS.FEED_CHANNELS;
    if (parentUrl) {
      params.append('parent_url', parentUrl);
    }
    if (channelId) {
      params.append('channel_id', channelId);
    }
  } else {
    params.append('time_window', '24h');
  }

  const url = `${NEYNAR_API_BASE_URL}${endpoint}?${params.toString()}`;
  
  console.log('🔍 Fetching trending feed:', url);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Trending feed error:', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(`Failed to fetch trending feed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Trending feed loaded:', data.casts?.length || 0, 'casts');
  return data;
}

export function useChannelFeed(
  type: 'trending' | 'channel',
  parentUrl?: string,
  channelId?: string
) {
  return useInfiniteQuery({
    queryKey: ['channelFeed', type, parentUrl, channelId],
    queryFn: ({ pageParam }) => fetchChannelFeed(type, parentUrl, channelId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

