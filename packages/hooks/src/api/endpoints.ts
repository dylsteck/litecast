// API endpoint definitions
// These map to the Next.js API routes in apps/web

export const API_ENDPOINTS = {
  // Feed endpoints
  FEED: '/api/feed',
  FEED_FOR_YOU: '/api/feed/for-you',
  FEED_TRENDING: '/api/feed/trending',
  FEED_CHANNEL: '/api/channel',

  // Cast/Thread endpoints
  THREAD: '/api/thread',
  CAST: '/api/cast',

  // User endpoints
  USER: '/api/user',
  USER_CASTS: '/api/user/casts',
  USER_REACTIONS: '/api/user/reactions',

  // Notifications
  NOTIFICATIONS: '/api/notifications',

  // Search
  SEARCH_CASTS: '/api/search/casts',
  SEARCH_USERS: '/api/search/users',
  SEARCH_FRAMES: '/api/search/frames',

  // Signer (auth)
  SIGNER: '/api/signer',
} as const;
