import { useInfiniteQuery } from '@tanstack/react-query';
import { NeynarFeedResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS, DEFAULT_FID } from '../../lib/neynar/constants';

async function fetchForYouFeed(
  fid: number,
  cursor?: string
): Promise<NeynarFeedResponse> {
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

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.FEED_FOR_YOU}?${params.toString()}`;
  
  console.log('🔍 Fetching For You feed for FID:', fid);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 For You feed response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ For You feed error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch For You feed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ For You feed loaded:', data.casts?.length || 0, 'casts');
  return data;
}

export function useForYouFeed(fid: number = DEFAULT_FID) {
  return useInfiniteQuery({
    queryKey: ['forYouFeed', fid],
    queryFn: ({ pageParam }) => fetchForYouFeed(fid, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
