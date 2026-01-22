import type { NeynarEmbed } from '@litecast/types';

interface RichLinkPreviewProps {
  embed: NeynarEmbed;
}

export function RichLinkPreview({ embed }: RichLinkPreviewProps) {
  const url = embed.url;
  if (!url) return null;

  const metadata = embed.metadata;
  const openGraph = embed.open_graph;
  const frame = embed.frame;

  // Get display data from various sources
  const title = frame?.title || openGraph?.title || metadata?.title || metadata?.html?.ogTitle;
  const description = frame?.description || openGraph?.description || metadata?.description || metadata?.html?.ogDescription;
  const imageUrl = frame?.image || openGraph?.image_url || metadata?.image_url || metadata?.html?.ogImage?.[0]?.url;
  const siteName = metadata?.publisher || metadata?.html?.ogSiteName || getDomain(url);

  // If it's a frame/miniapp, show special styling
  if (frame?.frames_url || metadata?.frame?.frames_url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="block border border-brand-primary/30 rounded-xl overflow-hidden hover:border-brand-primary/50 transition-colors"
      >
        {imageUrl && (
          <div className="aspect-[1.91/1] bg-system-secondary-background">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-3 bg-brand-primary/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-full">
              Mini App
            </span>
            {frame?.developer && (
              <span className="text-xs text-system-secondary-label">
                by @{frame.developer.username}
              </span>
            )}
          </div>
          {title && (
            <h3 className="font-semibold text-system-label line-clamp-1">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-system-secondary-label line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
      </a>
    );
  }

  // Regular link preview
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block border border-system-separator rounded-xl overflow-hidden hover:bg-system-secondary-background/50 transition-colors"
    >
      {imageUrl && (
        <div className="aspect-[1.91/1] bg-system-secondary-background">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-system-secondary-label mb-1 truncate">
          {siteName}
        </p>
        {title && (
          <h3 className="font-semibold text-system-label line-clamp-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-system-secondary-label line-clamp-2 mt-1">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
