import type { NeynarCast } from './cast';

export interface NeynarOEmbed {
  url?: string;
  html?: string;
  type?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  width?: number;
  height?: number;
  version?: string;
  cache_age?: string;
  method?: string;
}

export interface NeynarFcFrameButton {
  title: string;
  action?: {
    url?: string;
    name?: string;
    type?: string;
    splashImageUrl?: string;
    splashBackgroundColor?: string;
  };
}

export interface NeynarFcFrame {
  version?: string;
  imageUrl?: string;
  button?: NeynarFcFrameButton;
}

export interface NeynarHtmlMetadata {
  oembed?: NeynarOEmbed;
  favicon?: string;
  ogImage?: Array<{ url: string; type?: string }>;
  ogLocale?: string;
  ogSiteName?: string;
  ogTitle?: string;
  ogDescription?: string;
  fcFrame?: NeynarFcFrame;
}

export interface NeynarMetadataFrame {
  version?: string;
  title?: string;
  image?: string;
  frames_url?: string;
}

export interface NeynarEmbedMetadata {
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  publisher?: string;
  logo_url?: string;
  mime_type?: string;
  content_type?: string;
  content_length?: number;
  image?: {
    height_px?: number;
    width_px?: number;
  };
  html?: NeynarHtmlMetadata;
  frame?: NeynarMetadataFrame;
}

export interface NeynarOpenGraph {
  title?: string;
  description?: string;
  image_url?: string;
  url?: string;
}

export interface NeynarFrameEmbed {
  url: string;
  title?: string;
  frames_url?: string;
  image?: string;
  buttons?: Array<{
    index: number;
    title: string;
    action_type: string;
  }>;
  description?: string;
  name?: string; // App name from manifest
  iconUrl?: string; // Square app icon
  icon_url?: string; // Alternative casing
  manifest?: {
    frame?: {
      name?: string;
      description?: string;
      iconUrl?: string;
    };
    miniapp?: {
      name?: string;
      description?: string;
      iconUrl?: string;
    };
  };
  developer?: {
    display_name: string;
    username: string;
    pfp_url: string;
    fid: number;
  };
  author?: {
    display_name: string;
    username: string;
    pfp_url: string;
    fid: number;
  };
}

export interface NeynarEmbed {
  url?: string;
  cast_id?: {
    fid: number;
    hash: string;
  };
  cast?: NeynarCast;
  metadata?: NeynarEmbedMetadata;
  open_graph?: NeynarOpenGraph;
  frame?: NeynarFrameEmbed;
}
