// Neynar API constants

export const NEYNAR_API_BASE_URL = 'https://api.neynar.com/v2';

export const NEYNAR_ENDPOINTS = {
  FEED: '/farcaster/feed',
  FEED_FOLLOWING: '/farcaster/feed/following',
  FEED_TRENDING: '/farcaster/feed/trending',
  FEED_FOR_YOU: '/farcaster/feed/for_you',
  FEED_CHANNELS: '/farcaster/feed/channels',
  FEED_USER_CASTS: '/farcaster/feed/user/casts',
  FEED_PARENT_URLS: '/farcaster/feed/parent_urls',
  CAST: '/farcaster/cast',
  CAST_CONVERSATION: '/farcaster/cast/conversation',
  CAST_PARENT: '/farcaster/cast/parent',
  USER_BY_FID: '/farcaster/user/bulk',
  USER_BY_USERNAME: '/farcaster/user/by_username',
  NOTIFICATIONS: '/farcaster/notifications',
  SEARCH_CASTS: '/farcaster/cast/search',
  SEARCH_USERS: '/farcaster/user/search',
  SEARCH_FRAMES: '/farcaster/frame/search',
  USER_REACTIONS: '/farcaster/reactions/user',
} as const;

export const DEFAULT_LIMIT = 25;
export const DEFAULT_FID = 616; // Testing FID

