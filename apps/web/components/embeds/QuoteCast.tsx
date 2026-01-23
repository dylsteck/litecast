import Link from 'next/link';
import type { NeynarEmbed } from '@litecast/types';
import { formatRelativeTime } from '@litecast/utils';
import { UserAvatar } from '../UserAvatar';

interface QuoteCastProps {
  embed: NeynarEmbed;
  compact?: boolean; // Fixed height for horizontal scroll layout
}

export function QuoteCast({ embed, compact = false }: QuoteCastProps) {
  const cast = embed.cast;
  if (!cast) return null;

  const { author, text, timestamp } = cast;

  return (
    <Link
      href={`/cast/${cast.hash}`}
      onClick={(e) => e.stopPropagation()}
      className={`block border border-system-separator rounded-xl p-3 hover:bg-system-secondary-background/50 transition-colors ${
        compact ? 'h-[340px] overflow-hidden' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          username={author.username}
          pfpUrl={author.pfp_url}
          size="sm"
          linked={false}
        />
        <span className="font-semibold text-sm text-system-label truncate">
          {author.display_name}
        </span>
        <span className="text-sm text-system-secondary-label truncate">
          @{author.username}
        </span>
        <span className="text-system-tertiary-label flex-shrink-0">·</span>
        <span className="text-sm text-system-secondary-label flex-shrink-0">
          {formatRelativeTime(timestamp)}
        </span>
      </div>
      <p className={`text-sm text-system-label whitespace-pre-wrap ${compact ? 'line-clamp-[10]' : 'line-clamp-4'}`}>
        {text}
      </p>
    </Link>
  );
}
