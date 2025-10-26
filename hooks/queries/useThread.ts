import { useQuery } from '@tanstack/react-query';
import { NeynarThreadResponse, NeynarFeedResponse, NeynarCast } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchThread(hash: string): Promise<NeynarThreadResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Neynar API key not configured');
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    identifier: hash,
    type: 'hash',
    reply_depth: '10',
    include_chronological_parent_casts: 'true',
    limit: '50',
  });
  
  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.CAST_CONVERSATION}?${params.toString()}`;
  
  console.log('🔍 Fetching thread:', hash);
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 Thread response:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Thread error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch thread: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Thread loaded - Main cast + replies:', 1 + (data.conversation?.direct_replies?.length || 0));
  console.log('📦 Full conversation structure:', {
    hasCast: !!data.conversation?.cast,
    directReplies: data.conversation?.direct_replies?.length || 0,
    chronologicalParents: data.conversation?.chronological_parent_casts?.length || 0,
    hasNext: !!data.next,
    nextCursor: data.next?.cursor,
  });
  console.log('🔍 Raw API response keys:', Object.keys(data));
  console.log('🔍 Conversation keys:', Object.keys(data.conversation || {}));
  if (data.conversation?.cast) {
    console.log('🎯 Main cast replies count:', data.conversation.cast.replies?.count);
  }
  if (data.conversation?.direct_replies?.length > 0) {
    console.log('🎯 Sample reply:', {
      author: data.conversation.direct_replies[0].author.username,
      text: data.conversation.direct_replies[0].text.substring(0, 100),
    });
  } else {
    console.log('⚠️ No direct_replies in response even though API returned 200');
  }
  return data;
}

export function useThread(hash: string) {
  return useQuery({
    queryKey: ['thread', hash],
    queryFn: () => fetchThread(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

