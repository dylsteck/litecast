export const FARCASTER_API_BASE_URL = 'https://client.farcaster.xyz';
export const FARCASTER_AUTH_RELAY_URL = 'https://relay.farcaster.xyz';

export const DEFAULT_PAGE_SIZE = 25;
export const FEED_STALE_TIME_MS = 1000 * 60 * 2;
export const VIEW_FLUSH_MS = 5000;
export const VIEW_FLUSH_URGENT_MS = 1000;

/** Public discover mix while unauthenticated (official ranked home requires a session). */
export const DISCOVER_FIDS = [3, 2, 1, 5650, 239, 616] as const;

export const SESSION_STORAGE_KEY = 'litecast.session.v1';
export const DEVICE_ID_STORAGE_KEY = 'litecast.device-id.v1';
export const HIDDEN_CASTS_STORAGE_KEY = 'litecast.hidden-casts.v1';
export const MUTED_FIDS_STORAGE_KEY = 'litecast.muted-fids.v1';
