import clsx from 'clsx';

interface ReactionBarProps {
  repliesCount: number;
  recastsCount: number;
  likesCount: number;
  liked?: boolean;
  recasted?: boolean;
  onLike?: () => void;
  onRecast?: () => void;
  onReply?: () => void;
}

export function ReactionBar({
  repliesCount,
  recastsCount,
  likesCount,
  liked = false,
  recasted = false,
  onLike,
  onRecast,
  onReply,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-4 mt-3">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReply?.();
        }}
        className="flex items-center gap-1.5 text-system-secondary-label hover:text-brand-primary transition-colors"
      >
        <CommentIcon className="w-4 h-4" />
        <span className="text-sm">{formatCount(repliesCount)}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRecast?.();
        }}
        className={clsx(
          'flex items-center gap-1.5 transition-colors',
          recasted
            ? 'text-green-500'
            : 'text-system-secondary-label hover:text-green-500'
        )}
      >
        <RecastIcon className="w-4 h-4" />
        <span className="text-sm">{formatCount(recastsCount)}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onLike?.();
        }}
        className={clsx(
          'flex items-center gap-1.5 transition-colors',
          liked
            ? 'text-red-500'
            : 'text-system-secondary-label hover:text-red-500'
        )}
      >
        <HeartIcon className="w-4 h-4" filled={liked} />
        <span className="text-sm">{formatCount(likesCount)}</span>
      </button>
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function RecastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
