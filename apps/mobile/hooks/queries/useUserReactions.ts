import { useInfiniteQuery } from '@tanstack/react-query';
import { UserReactionsResponse, ReactionType } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS, DEFAULT_FID } from '../../lib/neynar/constants';

async function fetchUserReactions(
  fid: number,
  type: ReactionType,
  cursor?: string
): Promise<UserReactionsResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Neynar API key not configured');
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    fid: fid.toString(),
    type: type,
    limit: '25',
  });
  
  if (cursor) {
    params.append('cursor', cursor);
  }

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.USER_REACTIONS}?${params.toString()}`;
  
  console.log('🔍 Fetching user reactions for FID:', fid, 'type:', type);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 User reactions response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ User reactions error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch user reactions: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ User reactions loaded:', data.reactions?.length || 0, 'items');
  return data;
}

export function useUserReactions(fid: number = DEFAULT_FID, type: ReactionType = 'all') {
  return useInfiniteQuery({
    queryKey: ['userReactions', fid, type],
    queryFn: ({ pageParam }) => fetchUserReactions(fid, type, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

