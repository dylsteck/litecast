import {
  NEYNAR_API_BASE_URL,
  NEYNAR_ENDPOINTS,
  DEFAULT_LIMIT,
} from './constants';
import {
  NeynarFeedResponse,
  NeynarThreadResponse,
  NeynarUserResponse,
  NeynarCastResponse,
  NeynarNotificationsResponse,
  FeedParams,
  ChannelFeedParams,
  TrendingFeedParams,
  ThreadParams,
  UserParams,
  CastParams,
  NotificationsParams,
  UserCastsParams,
} from './types';
import { handleNeynarError } from './errors';

export class NeynarClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = NEYNAR_API_BASE_URL;
  }

  private async fetchJSON(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      (error as any).response = { status: response.status, data: await response.json().catch(() => ({})) };
      throw error;
    }

    return response.json();
  }

  /**
   * Get feed for a specific user (following feed)
   */
  async getFeed(params: FeedParams): Promise<NeynarFeedResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.FEED_FOLLOWING, {
        fid: params.fid,
        cursor: params.cursor,
        limit: params.limit || DEFAULT_LIMIT,
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get trending feed
   */
  async getTrendingFeed(params: TrendingFeedParams = {}): Promise<NeynarFeedResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.FEED_TRENDING, {
        cursor: params.cursor,
        limit: params.limit || DEFAULT_LIMIT,
        time_window: params.time_window || '24h',
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get channel feed
   */
  async getChannelFeed(params: ChannelFeedParams): Promise<NeynarFeedResponse> {
    try {
      const requestParams: any = {
        cursor: params.cursor,
        limit: params.limit || DEFAULT_LIMIT,
        with_recasts: params.with_recasts !== false,
      };

      if (params.channel_id) {
        requestParams.channel_id = params.channel_id;
      } else if (params.parent_url) {
        requestParams.parent_url = params.parent_url;
      }

      return await this.fetchJSON(NEYNAR_ENDPOINTS.FEED_CHANNELS, requestParams);
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get conversation thread
   */
  async getThread(params: ThreadParams): Promise<NeynarThreadResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.CAST_CONVERSATION, {
        identifier: params.hash,
        type: 'hash',
        reply_depth: 10,
        include_chronological_parent_casts: true,
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get user profile by FID
   */
  async getUserProfile(fid: number): Promise<NeynarUserResponse> {
    try {
      const data = await this.fetchJSON(NEYNAR_ENDPOINTS.USER_BY_FID, {
        fids: fid.toString(),
      });
      return {
        user: data.users[0],
      };
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<NeynarUserResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.USER_BY_USERNAME, {
        username,
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get single cast by hash
   */
  async getCastByHash(params: CastParams): Promise<NeynarCastResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.CAST, {
        identifier: params.hash,
        type: 'hash',
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(params: NotificationsParams): Promise<NeynarNotificationsResponse> {
    try {
      const requestParams: any = {
        fid: params.fid,
        cursor: params.cursor,
        limit: params.limit || DEFAULT_LIMIT,
      };

      if (params.type && params.type.length > 0) {
        requestParams.type = params.type.join(',');
      }

      return await this.fetchJSON(NEYNAR_ENDPOINTS.NOTIFICATIONS, requestParams);
    } catch (error) {
      handleNeynarError(error);
    }
  }

  /**
   * Get user's casts
   */
  async getUserCasts(params: UserCastsParams): Promise<NeynarFeedResponse> {
    try {
      return await this.fetchJSON(NEYNAR_ENDPOINTS.FEED_USER_CASTS, {
        fid: params.fid,
        cursor: params.cursor,
        limit: params.limit || DEFAULT_LIMIT,
        viewer_fid: params.viewer_fid,
        include_replies: params.include_replies !== false,
      });
    } catch (error) {
      handleNeynarError(error);
    }
  }
}

// Export singleton instance factory
let clientInstance: NeynarClient | null = null;

export function getNeynarClient(apiKey?: string): NeynarClient {
  if (!clientInstance) {
    if (!apiKey) {
      throw new Error('Neynar API key is required');
    }
    clientInstance = new NeynarClient(apiKey);
  }
  return clientInstance;
}

