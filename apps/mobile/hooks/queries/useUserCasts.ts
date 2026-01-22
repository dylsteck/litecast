import { useInfiniteQuery } from '@tanstack/react-query';
import { NeynarFeedResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS, DEFAULT_FID } from '../../lib/neynar/constants';

async function fetchUserCasts(
  fid: number,
  includeReplies: boolean = true,
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
    include_replies: includeReplies.toString(),
  });
  
  if (cursor) {
    params.append('cursor', cursor);
  }

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.FEED_USER_CASTS}?${params.toString()}`;
  
  console.log('🔍 Fetching user casts for FID:', fid, 'includeReplies:', includeReplies);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 User casts response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ User casts error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch user casts: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ User casts loaded:', data.casts?.length || 0, 'casts');
  return data;
}

export function useUserCasts(fid: number = DEFAULT_FID, includeReplies: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['userCasts', fid, includeReplies],
    queryFn: ({ pageParam }) => fetchUserCasts(fid, includeReplies, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

