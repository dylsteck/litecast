import type { NeynarCast } from './cast';

export interface NeynarFeedResponse {
  casts: NeynarCast[];
  next: {
    cursor: string | null;
  };
}

export interface FeedParams {
  fid: number;
  cursor?: string;
  limit?: number;
}

export interface ChannelFeedParams {
  channel_id?: string;
  parent_url?: string;
  cursor?: string;
  limit?: number;
  with_recasts?: boolean;
}

export interface TrendingFeedParams {
  cursor?: string;
  limit?: number;
  time_window?: '1h' | '6h' | '12h' | '24h' | '7d' | '30d';
}

export interface NeynarChannel {
  id: string;
  url: string;
  name: string;
  description: string;
  image_url: string;
  lead_fid: number;
  follower_count: number;
}
