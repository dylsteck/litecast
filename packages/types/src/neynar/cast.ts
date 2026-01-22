import type { NeynarUser } from './user';
import type { NeynarEmbed } from './embeds';

export interface NeynarReactions {
  likes: Array<{
    fid: number;
    fname: string;
  }>;
  recasts: Array<{
    fid: number;
    fname: string;
  }>;
  likes_count: number;
  recasts_count: number;
}

export interface NeynarCast {
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number | null;
  };
  author: NeynarUser;
  text: string;
  timestamp: string;
  embeds: NeynarEmbed[];
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: NeynarUser[];
    recasts: NeynarUser[];
  };
  replies: {
    count: number;
  };
  mentioned_profiles: NeynarUser[];
  mentioned_profiles_ranges?: Array<{
    start: number;
    end: number;
  }>;
  viewer_context?: {
    liked: boolean;
    recasted: boolean;
  };
}

export interface NeynarCastResponse {
  cast: NeynarCast;
}

export interface CastParams {
  hash: string;
  viewer_fid?: number;
}

export interface SearchCastsParams {
  q: string;
  cursor?: string;
  limit?: number;
  viewer_fid?: number;
}

export interface SearchCastsResponse {
  result: {
    casts: NeynarCast[];
    next: {
      cursor: string | null;
    };
  };
}
