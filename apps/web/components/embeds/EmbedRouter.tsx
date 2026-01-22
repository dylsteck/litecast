import type { NeynarEmbed } from '@litecast/types';
import { ImageGallery } from './ImageGallery';
import { VideoEmbed } from './VideoEmbed';
import { QuoteCast } from './QuoteCast';
import { RichLinkPreview } from './RichLinkPreview';
import { YouTubeEmbed } from './YouTubeEmbed';

interface EmbedRouterProps {
  embeds: NeynarEmbed[];
}

export function EmbedRouter({ embeds }: EmbedRouterProps) {
  if (!embeds || embeds.length === 0) return null;

  // Separate embeds by type
  const images: string[] = [];
  const videos: NeynarEmbed[] = [];
  const quotedCasts: NeynarEmbed[] = [];
  const links: NeynarEmbed[] = [];

  for (const embed of embeds) {
    // Quoted cast
    if (embed.cast_id || embed.cast) {
      quotedCasts.push(embed);
      continue;
    }

    const url = embed.url;
    if (!url) continue;

    const mimeType = embed.metadata?.content_type || embed.metadata?.mime_type || '';

    // Images
    if (
      mimeType.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
    ) {
      images.push(url);
      continue;
    }

    // Videos
    if (
      mimeType.startsWith('video/') ||
      /\.(mp4|webm|mov)(\?|$)/i.test(url)
    ) {
      videos.push(embed);
      continue;
    }

    // YouTube
    if (isYouTubeUrl(url)) {
      videos.push(embed);
      continue;
    }

    // Everything else is a link
    links.push(embed);
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && <ImageGallery images={images} />}

      {videos.map((video, index) => (
        <div key={index}>
          {video.url && isYouTubeUrl(video.url) ? (
            <YouTubeEmbed url={video.url} />
          ) : (
            <VideoEmbed url={video.url!} />
          )}
        </div>
      ))}

      {quotedCasts.map((quoted, index) => (
        <QuoteCast key={index} embed={quoted} />
      ))}

      {links.map((link, index) => (
        <RichLinkPreview key={index} embed={link} />
      ))}
    </div>
  );
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(url);
}
