export type Fid = number;
export type CastHash = string;

export type AuthToken = {
  secret: string;
  expiresAt: number;
};

export type Session = {
  user: User;
  token: AuthToken;
  custodyAddress?: string;
};

export type UserPfp = {
  url: string;
  verified?: boolean;
};

export type User = {
  fid: Fid;
  username?: string;
  displayName: string;
  pfp?: UserPfp;
  profile?: {
    bio?: { text?: string };
    url?: string;
    location?: { description?: string };
    bannerImageUrl?: string;
  };
  followerCount?: number;
  followingCount?: number;
  viewerContext?: {
    following?: boolean;
    followedBy?: boolean;
    blocked?: boolean;
    muted?: boolean;
  };
};

export type EmbedImage = {
  type?: string;
  url: string;
  sourceUrl?: string;
  alt?: string;
  media?: { width?: number; height?: number; staticRaster?: string; mimeType?: string };
};

export type EmbedUrl = {
  type?: string;
  url: string;
  openGraph?: {
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
};

export type EmbedVideo = {
  type?: string;
  url: string;
  sourceUrl?: string;
};

export type CastEmbeds = {
  images?: EmbedImage[];
  urls?: EmbedUrl[];
  videos?: EmbedVideo[];
  casts?: Cast[];
  unknowns?: unknown[];
};

export type Cast = {
  hash: CastHash;
  threadHash?: CastHash;
  parentHash?: CastHash;
  text: string;
  timestamp: number;
  author: User;
  replies?: { count: number };
  reactions?: { count: number };
  recasts?: { count: number; recasters?: User[] };
  quoteCount?: number;
  viewCount?: number;
  embeds?: CastEmbeds;
  channel?: Channel;
  viewerContext?: {
    reacted?: boolean;
    recast?: boolean;
    bookmarked?: boolean;
  };
};

export type IncludeReason =
  | 'popular'
  | 'following-author'
  | 'evergreen-following-author'
  | 'popular-in-channel'
  | 'follow-of-follow'
  | 'recasted-by-following'
  | 'pinned-in-channel'
  | 'has-reply-by-followed'
  | 'high-quality-unfollowed'
  | 'snap-promoted';

export type FeedItem = {
  id: string;
  timestamp: number;
  pinned?: boolean;
  cast: Cast;
  replies?: Cast[];
  meta?: {
    includeReason?: { type: IncludeReason };
    labelReason?: string;
    score?: number;
    authorQuality?: string;
  };
};

export type Channel = {
  type?: string;
  key: string;
  name: string;
  description?: string;
  imageUrl?: string;
  followerCount?: number;
  memberCount?: number;
  url?: string;
  viewerContext?: { following?: boolean };
};

export type NotificationGroup = {
  id: string;
  type: string;
  latestTimestamp: number;
  totalItemCount: number;
  isUnread?: boolean;
  previewItems?: Array<{
    user?: User;
    actor?: User;
    cast?: Cast;
    text?: string;
  }>;
};

export type DirectCastConversation = {
  conversationId: string;
  name?: string;
  photoUrl?: string;
  isGroup?: boolean;
  unreadCount?: number;
  muted?: boolean;
  lastMessage?: { text?: string; timestamp?: number };
  participants?: User[];
};

export type Page<T> = {
  items: T[];
  cursor?: string;
};

export type CastViewEvent = {
  ts: number;
  hash: CastHash;
  feed?: string;
  reason?: string;
  position?: number;
};

