export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  active_status: 'active' | 'inactive';
  power_badge?: boolean;
  score?: number; // Neynar relevance score for search results
}

export interface NeynarUserResponse {
  user: NeynarUser;
}

export interface UserParams {
  fid?: number;
  username?: string;
}

export interface UserCastsParams {
  fid: number;
  cursor?: string;
  limit?: number;
  viewer_fid?: number;
  include_replies?: boolean;
}

export interface SearchUsersParams {
  q: string;
  cursor?: string;
  limit?: number;
  viewer_fid?: number;
}

export interface SearchUsersResponse {
  result: {
    users: NeynarUser[];
    next: {
      cursor: string | null;
    };
  };
}

export type ReactionType = 'likes' | 'recasts' | 'all';

export interface NeynarReaction {
  reaction_type: 'like' | 'recast';
  cast: import('./cast').NeynarCast;
  reaction_timestamp: string;
  object: 'likes' | 'recasts';
  user: {
    object: 'user_dehydrated';
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
}

export interface UserReactionsResponse {
  reactions: NeynarReaction[];
  next: {
    cursor: string | null;
  };
}

export interface UserReactionsParams {
  fid: number;
  type: ReactionType;
  cursor?: string;
  limit?: number;
}
