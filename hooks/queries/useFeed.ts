import { useInfiniteQuery } from '@tanstack/react-query';
import { NeynarFeedResponse } from '../../lib/neynar/types';
import { DEFAULT_FID, NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchFeed(fid: number, cursor?: string): Promise<NeynarFeedResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Neynar API key not configured');
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    fid: fid.toString(),
    limit: '25',
  });
  
  if (cursor) {
    params.append('cursor', cursor);
  }

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.FEED_FOLLOWING}?${params.toString()}`;
  
  console.log('🔍 Fetching following feed for FID:', fid);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 Following feed response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Following feed error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Following feed loaded:', data.casts?.length || 0, 'casts');
  return data;
}

export function useFeed(fid: number = DEFAULT_FID) {
  return useInfiniteQuery({
    queryKey: ['feed', fid],
    queryFn: ({ pageParam }) => fetchFeed(fid, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

