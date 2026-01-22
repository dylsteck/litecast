import type { NeynarCast } from './cast';
import type { NeynarUser } from './user';

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
