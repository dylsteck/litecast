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
}

export interface NeynarEmbed {
  url?: string;
  cast_id?: {
    fid: number;
    hash: string;
  };
}

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

export interface NeynarFeedResponse {
  casts: NeynarCast[];
  next: {
    cursor: string | null;
  };
}

export interface NeynarThreadResponse {
  conversation: {
    cast: NeynarCast;
    direct_replies: NeynarCast[];
  };
}

export interface NeynarUserResponse {
  user: NeynarUser;
}

export interface NeynarCastResponse {
  cast: NeynarCast;
}

// Request parameter types
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

export interface ThreadParams {
  hash: string;
  viewer_fid?: number;
}

export interface UserParams {
  fid?: number;
  username?: string;
}

export interface CastParams {
  hash: string;
  viewer_fid?: number;
}

// Notification types
export type NotificationType = 'follows' | 'recasts' | 'likes' | 'mentions' | 'replies';

export interface NeynarNotification {
  object: 'notification';
  most_recent_timestamp: string;
  type: NotificationType;
  seen?: boolean;
  cast?: NeynarCast;
  follows?: Array<{
    object: 'follower';
    user: NeynarUser;
  }>;
  reactions?: Array<{
    object: 'likes' | 'recasts';
    user: NeynarUser;
    cast: NeynarCast;
  }>;
  count?: number;
}

export interface NeynarNotificationsResponse {
  notifications: NeynarNotification[];
  next: {
    cursor: string | null;
  };
  unseen_notifications_count?: number;
}

export interface NotificationsParams {
  fid: number;
  type?: NotificationType[];
  cursor?: string;
  limit?: number;
}

export interface UserCastsParams {
  fid: number;
  cursor?: string;
  limit?: number;
  viewer_fid?: number;
  include_replies?: boolean;
}

// Search types
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

export interface NeynarFrame {
  uuid: string;
  name: string;
  description: string;
  image: string;
  frame_url: string;
  developer: {
    display_name: string;
    username: string;
    pfp_url: string;
    fid: number;
  };
}

export interface SearchFramesParams {
  q: string;
  cursor?: string;
  limit?: number;
}

export interface SearchFramesResponse {
  result: {
    frames: NeynarFrame[];
    next: {
      cursor: string | null;
    };
  };
}

// User Reactions types
export type ReactionType = 'likes' | 'recasts' | 'all';

export interface NeynarReaction {
  reaction_type: 'like' | 'recast';
  cast: NeynarCast;
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

