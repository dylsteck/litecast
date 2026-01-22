import { NeynarEmbed } from '../../lib/neynar/types';

export type EmbedPlatform = 'twitter' | 'youtube' | 'github' | 'miniapp' | 'generic';

/**
 * Detect platform from URL
 */
export const getPlatformFromUrl = (url: string): EmbedPlatform => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('github.com')) return 'github';
    return 'generic';
  } catch {
    return 'generic';
  }
};

/**
 * Extract tweet text from Twitter oEmbed HTML blockquote
 */
export const parseTwitterHtml = (html: string): { text: string; date?: string } => {
  // Remove script tags
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Extract text from blockquote
  const blockquoteMatch = cleaned.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!blockquoteMatch) {
    return { text: '' };
  }
  
  let text = blockquoteMatch[1];
  
  // Extract date from anchor tag
  const dateMatch = text.match(/<a[^>]*>([^<]+)<\/a>/);
  const date = dateMatch ? dateMatch[1].trim() : undefined;
  
  // Remove date anchor
  text = text.replace(/<a[^>]*>([^<]+)<\/a>/g, '');
  
  // Convert <br> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\n\s*\n/g, '\n').trim();
  
  return { text, date };
};

/**
 * Extract author handle from Twitter author URL
 */
export const extractTwitterHandle = (authorUrl?: string): string | null => {
  if (!authorUrl) return null;
  const match = authorUrl.match(/twitter\.com\/([^\/]+)/i) || authorUrl.match(/x\.com\/([^\/]+)/i);
  return match ? `@${match[1]}` : null;
};

/**
 * Get domain from URL for display
 */
export const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Check if embed is a miniapp/frame
 * Checks multiple locations where frame data can appear
 */
export const isMiniAppEmbed = (embed: NeynarEmbed): boolean => {
  return !!(
    embed.frame || 
    embed.metadata?.frame || 
    embed.metadata?.html?.fcFrame
  );
};

/**
 * Extract frame data from embed (normalizes different locations)
 */
export const getFrameData = (embed: NeynarEmbed) => {
  // Direct frame embed
  if (embed.frame) {
    return embed.frame;
  }
  
  // Frame from metadata.frame and metadata.html.fcFrame
  const metaFrame = embed.metadata?.frame;
  const fcFrame = embed.metadata?.html?.fcFrame;
  
  if (metaFrame || fcFrame) {
    return {
      url: embed.url || metaFrame?.frames_url || '',
      title: fcFrame?.button?.action?.name || metaFrame?.title || fcFrame?.button?.title,
      image: fcFrame?.imageUrl || metaFrame?.image,
      frames_url: metaFrame?.frames_url || embed.url,
      buttons: fcFrame?.button ? [{
        index: 0,
        title: fcFrame.button.title || 'Open',
        action_type: fcFrame.button.action?.type || 'launch_frame',
      }] : undefined,
      // Additional fcFrame data
      splashImageUrl: fcFrame?.button?.action?.splashImageUrl,
      splashBackgroundColor: fcFrame?.button?.action?.splashBackgroundColor,
    };
  }
  
  return null;
};

/**
 * Check if embed is a quote cast
 */
export const isQuoteCastEmbed = (embed: NeynarEmbed): boolean => {
  return !!embed.cast;
};

/**
 * Check if embed is a video
 */
export const isVideoEmbed = (embed: NeynarEmbed): boolean => {
  if (!embed.url) return false;
  
  // Check content type
  const mimeType = embed.metadata?.content_type || embed.metadata?.mime_type;
  if (mimeType) {
    if (mimeType.startsWith('video/')) return true;
    if (mimeType === 'application/vnd.apple.mpegurl') return true; // m3u8
  }
  
  // Check URL extension
  const videoExtensions = /\.(m3u8|mp4|mov|webm|avi|mkv)(\?.*)?$/i;
  if (videoExtensions.test(embed.url)) return true;
  
  // Check if it's stream.farcaster.xyz
  try {
    const url = new URL(embed.url);
    if (url.hostname.includes('stream.farcaster.xyz')) return true;
  } catch {
    // Invalid URL
  }
  
  // Check if metadata has video info
  if (embed.metadata?.video) return true;
  
  return false;
};

/**
 * Get video aspect ratio from embed metadata
 * Returns the aspect ratio (width/height) from the highest quality stream, or null if not available
 */
export const getVideoAspectRatio = (embed: NeynarEmbed): number | null => {
  const videoMetadata = embed.metadata?.video;
  if (!videoMetadata || !videoMetadata.streams || videoMetadata.streams.length === 0) {
    return null;
  }

  // Get the highest quality stream (usually the first one, or find the one with largest dimensions)
  const streams = videoMetadata.streams;
  const highestQualityStream = streams.reduce((prev, current) => {
    const prevPixels = (prev.width_px || 0) * (prev.height_px || 0);
    const currentPixels = (current.width_px || 0) * (current.height_px || 0);
    return currentPixels > prevPixels ? current : prev;
  });

  const width = highestQualityStream.width_px;
  const height = highestQualityStream.height_px;

  if (width && height && height > 0) {
    return width / height;
  }

  return null;
};
