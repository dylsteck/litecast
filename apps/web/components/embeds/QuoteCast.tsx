import Link from 'next/link';
import type { NeynarEmbed } from '@litecast/types';
import { formatRelativeTime } from '@litecast/utils';
import { UserAvatar } from '../UserAvatar';

interface QuoteCastProps {
  embed: NeynarEmbed;
}

export function QuoteCast({ embed }: QuoteCastProps) {
  const cast = embed.cast;
  if (!cast) return null;

  const { author, text, timestamp } = cast;

  return (
    <Link
      href={`/cast/${cast.hash}`}
      onClick={(e) => e.stopPropagation()}
      className="block border border-system-separator rounded-xl p-3 hover:bg-system-secondary-background/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          username={author.username}
          pfpUrl={author.pfp_url}
          size="sm"
          linked={false}
        />
        <span className="font-semibold text-sm text-system-label">
          {author.display_name}
        </span>
        <span className="text-sm text-system-secondary-label">
          @{author.username}
        </span>
        <span className="text-system-tertiary-label">·</span>
        <span className="text-sm text-system-secondary-label">
          {formatRelativeTime(timestamp)}
        </span>
      </div>
      <p className="text-sm text-system-label line-clamp-4 whitespace-pre-wrap">
        {text}
      </p>
    </Link>
  );
}
