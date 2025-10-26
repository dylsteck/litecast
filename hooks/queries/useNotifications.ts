import { useInfiniteQuery } from '@tanstack/react-query';
import { NeynarNotificationsResponse, NotificationType } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS, DEFAULT_FID } from '../../lib/neynar/constants';

async function fetchNotifications(
  fid: number,
  type?: NotificationType[],
  cursor?: string
): Promise<NeynarNotificationsResponse> {
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

  if (type && type.length > 0) {
    params.append('type', type.join(','));
  }

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`;
  
  console.log('🔍 Fetching notifications for FID:', fid, 'type:', type?.join(',') || 'all');
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 Notifications response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Notifications error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Notifications loaded:', data.notifications?.length || 0, 'items');
  return data;
}

export function useNotifications(fid: number = DEFAULT_FID, type?: NotificationType[]) {
  return useInfiniteQuery({
    queryKey: ['notifications', fid, type],
    queryFn: ({ pageParam }) => fetchNotifications(fid, type, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

