import { FARCASTER_API_BASE_URL, FARCASTER_AUTH_RELAY_URL } from './config';
import { FarcasterApiError, messageFromApiErrorBody } from './errors';
import type {
  AuthChannel,
  AuthChannelStatus,
  AuthToken,
  Cast,
  CastHash,
  CastViewEvent,
  Channel,
  DirectCastConversation,
  FeedItem,
  Fid,
  IncludeReason,
  NotificationGroup,
  Page,
  User,
} from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  auth?: AuthToken | null;
  timeoutMs?: number;
};

function toSearch(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class FarcasterClient {
  constructor(
    private readonly options: {
      baseUrl?: string;
      getToken: () => AuthToken | null;
      getDeviceId: () => string;
      getFid?: () => number | undefined;
    },
  ) {}

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';
    const token = options.auth === undefined ? this.options.getToken() : options.auth;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'FC-DEVICE-ID': this.options.getDeviceId(),
    };

    const fid = this.options.getFid?.();
    if (fid) headers['FC-FID'] = String(fid);
    if (token?.secret) headers.Authorization = `Bearer ${token.secret}`;
    if (method !== 'GET') headers['Idempotency-Key'] = crypto.randomUUID();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 20_000);

    try {
      const response = await fetch(`${this.options.baseUrl ?? FARCASTER_API_BASE_URL}${path}${toSearch(options.query)}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new FarcasterApiError({
          status: response.status,
          path,
          message: messageFromApiErrorBody(data, `Farcaster API ${response.status}`),
        });
      }

      return data as T;
    } catch (error) {
      if (error instanceof FarcasterApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FarcasterApiError({ status: 408, path, message: 'Request timed out' });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  getUserByFid(fid: Fid) {
    return this.request<{ result: { user: User } }>('/v2/user-by-fid', { query: { fid } });
  }

  getUserByUsername(username: string) {
    return this.request<{ result: { user: User } }>('/v2/user-by-username', { query: { username } });
  }

  getMe() {
    return this.request<{ result: { user: User } }>('/v2/me');
  }

  getUserCasts({ fid, cursor, limit }: { fid: Fid; cursor?: string; limit: number }) {
    return this.request<{ result: { casts: Cast[] }; next?: { cursor?: string } }>('/v2/profile-casts', {
      query: { fid, cursor, limit },
    });
  }

  getThread(castHash: CastHash) {
    return this.request<{ result: { casts: Cast[] } }>('/v2/thread-casts', { query: { castHash } });
  }

  getCastLikes(castHash: CastHash) {
    return this.request<{ result: { likes: Array<{ reactor: User }> } }>('/v2/cast-likes', {
      query: { castHash },
    });
  }

  searchCasts({ q, cursor, limit }: { q: string; cursor?: string; limit: number }) {
    return this.request<{ result: { casts: Cast[] }; next?: { cursor?: string } }>('/v2/search-casts', {
      query: { q, cursor, limit },
    });
  }

  searchUsers({ q, cursor, limit }: { q: string; cursor?: string; limit: number }) {
    return this.request<{ result: { users: User[] }; next?: { cursor?: string } }>('/v2/search-users', {
      query: { q, cursor, limit },
    });
  }

  searchChannels({ q, cursor, limit }: { q: string; cursor?: string; limit: number }) {
    return this.request<{ result: { channels: Channel[] }; next?: { cursor?: string } }>(
      '/v2/search-channels',
      { query: { q, cursor, limit } },
    );
  }

  getAllChannels() {
    return this.request<{ result: { channels: Channel[] } }>('/v2/all-channels');
  }

  getChannel(key: string) {
    return this.request<{ result: { channel: Channel } }>('/v2/channel', { query: { key } });
  }

  getFeedItems({
    feedKey,
    feedType = 'default',
    olderThan,
    latestMainCastTimestamp,
    excludeItemIdPrefixes,
    castViewEvents,
    updateState,
    includeUserSuggestions,
    includeTrendingTopics,
  }: {
    feedKey: string;
    feedType?: string;
    olderThan?: number;
    latestMainCastTimestamp?: number;
    excludeItemIdPrefixes?: string[];
    castViewEvents?: CastViewEvent[];
    updateState?: boolean;
    includeUserSuggestions?: boolean;
    includeTrendingTopics?: boolean;
  }) {
    return this.request<{
      result: {
        items: FeedItem[];
        suggestedUsers?: User[];
        latestMainCastTimestamp?: number;
      };
    }>('/v2/feed-items', {
      method: 'POST',
      body: {
        feedKey,
        feedType,
        olderThan,
        latestMainCastTimestamp,
        excludeItemIdPrefixes,
        castViewEvents,
        updateState,
        includeUserSuggestions,
        includeTrendingTopics,
      },
    });
  }

  recordAnalyticsEvents(events: Array<{ type: string; ts: number; data: Record<string, unknown> }>) {
    return this.request<{ result: { success: boolean } }>('/v1/analytics-events', {
      method: 'POST',
      body: { events },
    });
  }

  getNotifications({ tab, cursor, limit }: { tab: string; cursor?: string; limit: number }) {
    return this.request<{ result: { notifications: NotificationGroup[] }; next?: { cursor?: string } }>(
      '/v1/notifications-for-tab',
      { query: { tab, cursor, limit } },
    );
  }

  getInbox() {
    return this.request<{ result: { conversations: DirectCastConversation[] } }>(
      '/v2/direct-cast-inbox',
    );
  }

  createCast(body: { text: string; parent?: { hash: CastHash }; embeds?: string[]; channelKey?: string }) {
    return this.request<{ result: { cast: Cast } }>('/v2/casts', { method: 'POST', body });
  }

  deleteCast(castHash: CastHash) {
    return this.request<{ result: { success: boolean } }>('/v2/casts', {
      method: 'DELETE',
      body: { castHash },
    });
  }

  likeCast(castHash: CastHash) {
    return this.request('/v2/cast-likes', { method: 'PUT', body: { castHash } });
  }

  unlikeCast(castHash: CastHash) {
    return this.request('/v2/cast-likes', { method: 'DELETE', body: { castHash } });
  }

  recast(castHash: CastHash) {
    return this.request('/v2/recasts', { method: 'PUT', body: { castHash } });
  }

  unrecast(castHash: CastHash) {
    return this.request('/v2/recasts', { method: 'DELETE', body: { castHash } });
  }

  follow(targetFid: Fid) {
    return this.request('/v2/follows', { method: 'PUT', body: { targetFid } });
  }

  unfollow(targetFid: Fid) {
    return this.request('/v2/follows', { method: 'DELETE', body: { targetFid } });
  }

  bookmark(castHash: CastHash) {
    return this.request('/v2/bookmark-cast', { method: 'PUT', body: { castHash } });
  }

  downvoteCast(castHash: CastHash) {
    return this.request('/v2/debug-cast-embeds', {
      method: 'PUT',
      body: { castHash, downvote: true, isWarning: false },
    });
  }

  setFeedSeen(feeds: Array<{ feedKey: string; feedType: string; latestItemTimestamp: number; accessTimestamp: number }>) {
    return this.request('/v2/feed-seen', { method: 'PUT', body: { feeds } });
  }
}

export async function createAuthChannel({
  domain,
  siweUri,
}: {
  domain: string;
  siweUri: string;
}): Promise<AuthChannel> {
  const response = await fetch(`${FARCASTER_AUTH_RELAY_URL}/v1/channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siweUri, domain }),
  });
  if (!response.ok) {
    throw new FarcasterApiError({
      status: response.status,
      path: '/v1/channel',
      message: 'Could not start Farcaster sign-in',
    });
  }
  return response.json();
}

export async function pollAuthChannel(channelToken: string): Promise<AuthChannelStatus> {
  const response = await fetch(`${FARCASTER_AUTH_RELAY_URL}/v1/channel/status`, {
    headers: { Authorization: `Bearer ${channelToken}` },
  });
  if (!response.ok) {
    throw new FarcasterApiError({
      status: response.status,
      path: '/v1/channel/status',
      message: 'Could not check Farcaster sign-in',
    });
  }
  return response.json();
}

export function pageFromCasts(response: { result: { casts: Cast[] }; next?: { cursor?: string } }): Page<Cast> {
  return { items: response.result.casts ?? [], cursor: response.next?.cursor };
}

export function pageFromFeedItems(response: { result: { items: FeedItem[] } }): Page<FeedItem> {
  return { items: response.result.items ?? [] };
}

export function includeReasonLabel(reason?: IncludeReason): string | undefined {
  switch (reason) {
    case 'following-author':
      return 'Following';
    case 'follow-of-follow':
      return 'Follow of follow';
    case 'recasted-by-following':
      return 'Recasted by someone you follow';
    case 'popular':
      return 'Popular';
    case 'high-quality-unfollowed':
      return 'Recommended';
    case 'popular-in-channel':
      return 'Popular in channel';
    case 'has-reply-by-followed':
      return 'Reply from someone you follow';
    case 'evergreen-following-author':
      return 'From someone you follow';
    case 'pinned-in-channel':
      return 'Pinned';
    case 'snap-promoted':
      return 'Promoted';
    default:
      return undefined;
  }
}
