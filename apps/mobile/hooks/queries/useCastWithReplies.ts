import { useQueries } from '@tanstack/react-query';
import { NeynarCast, NeynarFeedResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchCast(hash: string): Promise<{ cast: NeynarCast }> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    identifier: hash,
    type: 'hash',
  });
  
  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.CAST}?${params.toString()}`;
  
  console.log('🔍 Fetching main cast:', hash);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cast: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Main cast loaded, replies count:', data.cast?.replies?.count || 0);
  return data;
}

async function fetchReplies(parentHash: string, authorFid: number): Promise<{ casts: NeynarCast[] }> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  // Use the parent cast endpoint
  const params = new URLSearchParams({
    identifier: `${authorFid}:${parentHash}`,
    type: 'hash',
    limit: '50',
  });
  
  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.CAST_PARENT}?${params.toString()}`;
  
  console.log('🔍 Fetching replies from parent endpoint');
  console.log('🌐 URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    console.log('⚠️ Parent cast fetch failed:', response.status);
    const errorText = await response.text();
    console.log('📛 Error:', errorText.substring(0, 300));
    return { casts: [] };
  }
  
  const data = await response.json();
  console.log('📦 Parent response keys:', Object.keys(data));
  console.log('✅ Casts from parent:', data.casts?.length || 0);
  
  if (data.casts && data.casts.length > 0) {
    console.log('🎯 Sample:', data.casts[0].author.username, '-', data.casts[0].text.substring(0, 50));
  }
  
  return { casts: data.casts || [] };
}

export function useCastWithReplies(hash: string) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['cast', hash],
        queryFn: () => fetchCast(hash),
        enabled: !!hash,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['replies', hash],
        queryFn: async () => {
          // Need to wait for cast to get the author FID
          const castData = await fetchCast(hash);
          if (castData.cast) {
            return fetchReplies(hash, castData.cast.author.fid);
          }
          return { casts: [] };
        },
        enabled: !!hash,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const [castQuery, repliesQuery] = results;

  return {
    cast: castQuery.data?.cast,
    replies: repliesQuery.data?.casts || [],
    isLoading: castQuery.isLoading || repliesQuery.isLoading,
    error: castQuery.error || repliesQuery.error,
    refetch: () => {
      castQuery.refetch();
      repliesQuery.refetch();
    },
  };
}

