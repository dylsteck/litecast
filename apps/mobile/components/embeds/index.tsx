import React from 'react';
import type { NeynarEmbed } from '@litecast/types';
import { getPlatformFromUrl, isMiniAppEmbed, isQuoteCastEmbed, getFrameData, isVideoEmbed } from './utils';
import TwitterEmbed from './TwitterEmbed';
import YouTubeEmbed from './YouTubeEmbed';
import GitHubEmbed from './GitHubEmbed';
import MiniAppEmbed from './MiniAppEmbed';
import VideoEmbed from './VideoEmbed';
import RichLinkPreview from './RichLinkPreview';

interface EmbedRouterProps {
  embed: NeynarEmbed;
  index?: number;
}

/**
 * Router component that determines which embed component to render
 * based on the embed type and URL platform
 */
export const EmbedRouter = ({ embed, index = 0 }: EmbedRouterProps) => {
  // Quote cast embeds are handled separately in Cast.tsx
  if (isQuoteCastEmbed(embed)) {
    return null; // Cast.tsx handles this
  }

  // Video embeds (check before other URL embeds)
  if (isVideoEmbed(embed)) {
    return <VideoEmbed key={`video-${embed.url}-${index}`} embed={embed} />;
  }

  // Mini App / Frame embeds - check all possible locations
  if (isMiniAppEmbed(embed)) {
    const frameData = getFrameData(embed);
    if (frameData) {
      return <MiniAppEmbed key={`miniapp-${frameData.url}-${index}`} frame={frameData} />;
    }
  }

  // URL embeds - detect platform
  if (embed.url) {
    const platform = getPlatformFromUrl(embed.url);
    
    switch (platform) {
      case 'twitter':
        return <TwitterEmbed key={`twitter-${embed.url}-${index}`} embed={embed} />;
      case 'youtube':
        return <YouTubeEmbed key={`youtube-${embed.url}-${index}`} embed={embed} />;
      case 'github':
        return <GitHubEmbed key={`github-${embed.url}-${index}`} embed={embed} />;
      default:
        return <RichLinkPreview key={`link-${embed.url}-${index}`} embed={embed} />;
    }
  }

  return null;
};

// Export individual components for direct use if needed
export { default as TwitterEmbed } from './TwitterEmbed';
export { default as YouTubeEmbed } from './YouTubeEmbed';
export { default as GitHubEmbed } from './GitHubEmbed';
export { default as MiniAppEmbed } from './MiniAppEmbed';
export { default as VideoEmbed } from './VideoEmbed';
export { default as RichLinkPreview } from './RichLinkPreview';

// Export utilities
export * from './utils';
