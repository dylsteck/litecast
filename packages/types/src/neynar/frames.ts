export interface NeynarFrame {
  uuid?: string;
  version?: string;
  image: string;
  frames_url?: string;
  frame_url?: string;
  title?: string;
  name?: string;
  description?: string;
  manifest?: {
    frame?: {
      name?: string;
      description?: string;
    };
    miniapp?: {
      name?: string;
      description?: string;
    };
  };
  author?: {
    display_name: string;
    username: string;
    pfp_url: string;
    fid: number;
  };
  developer?: {
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
  frames: NeynarFrame[];
  next: {
    cursor: string | null;
  };
}
