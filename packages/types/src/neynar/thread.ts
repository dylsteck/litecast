import type { NeynarCast } from './cast';

export interface NeynarThreadResponse {
  conversation: {
    cast: NeynarCast;
    direct_replies: NeynarCast[];
  };
}

export interface ThreadParams {
  hash: string;
  viewer_fid?: number;
}
