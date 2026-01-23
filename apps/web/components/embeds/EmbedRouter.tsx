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

  // Calculate total non-image embeds for horizontal scrolling
  const totalNonImageEmbeds = videos.length + quotedCasts.length + links.length;
  const hasMultipleEmbeds = totalNonImageEmbeds > 1;

  return (
    <div className="space-y-3">
      {images.length > 0 && <ImageGallery images={images} />}

      {/* Horizontal scrollable container for multiple embeds */}
      {totalNonImageEmbeds > 0 && (
        <div
          className={hasMultipleEmbeds ? 'overflow-x-auto -mx-4 px-4 scrollbar-hide' : ''}
        >
          <div className={hasMultipleEmbeds ? 'flex gap-3' : 'space-y-3'}>
            {videos.map((video, index) => (
              <div
                key={index}
                className={hasMultipleEmbeds ? 'flex-shrink-0 w-[420px]' : ''}
              >
                {video.url && isYouTubeUrl(video.url) ? (
                  <YouTubeEmbed url={video.url} />
                ) : (
                  <VideoEmbed url={video.url!} />
                )}
              </div>
            ))}

            {quotedCasts.map((quoted, index) => (
              <div
                key={index}
                className={hasMultipleEmbeds ? 'flex-shrink-0 w-[420px]' : ''}
              >
                <QuoteCast embed={quoted} compact={hasMultipleEmbeds} />
              </div>
            ))}

            {links.map((link, index) => (
              <div
                key={index}
                className={hasMultipleEmbeds ? 'flex-shrink-0 w-[420px]' : ''}
              >
                <RichLinkPreview embed={link} compact={hasMultipleEmbeds} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(url);
}
