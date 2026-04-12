'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import type { NeynarCast } from '@litecast/types';
import { formatRelativeTime } from '@litecast/utils';
import { usePrefetchThread, usePrefetchUser, usePostReactionMessage } from '@litecast/hooks';
import { buildSignedReactionAddJson } from '@litecast/farcaster-messages';
import { UserAvatar } from './UserAvatar';
import { ReactionBar } from './ReactionBar';
import { EmbedRouter } from './embeds/EmbedRouter';
import { useLitecastSession } from './LitecastSessionContext';

interface CastProps {
  cast: NeynarCast;
  showThread?: boolean;
}

export function Cast({ cast, showThread = false }: CastProps) {
  const router = useRouter();
  const prefetchThread = usePrefetchThread();
  const prefetchUser = usePrefetchUser();
  const postReaction = usePostReactionMessage();
  const { session, canWrite } = useLitecastSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const hasPrefetchedThread = useRef(false);
  const { author, text, timestamp, embeds, reactions, replies, viewer_context } = cast;

  const submitReaction = useCallback(
    async (reactionType: 'like' | 'recast') => {
      if (!canWrite || !session?.signer?.fid || !session.signer.privateKey) {
        setActionError('Sign in and enable posting to react.');
        return;
      }
      setActionError(null);
      try {
        const message = await buildSignedReactionAddJson({
          fid: session.signer.fid,
          signerPrivateKeyHex: session.signer.privateKey,
          targetFid: author.fid,
          targetHash: cast.hash,
          reactionType,
        });
        await postReaction.mutateAsync(message);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Reaction failed');
      }
    },
    [
      author.fid,
      canWrite,
      cast.hash,
      postReaction,
      session?.signer?.fid,
      session?.signer?.privateKey,
    ]
  );

  // Prefetch thread data on hover - eliminates loading states
  // Inspired by Base App: https://blog.base.dev/base-app-prefetching-at-scale
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetchedThread.current) {
      hasPrefetchedThread.current = true;
      prefetchThread(cast.hash);
    }
  }, [cast.hash, prefetchThread]);

  // Prefetch author profile when hovering on their name/avatar
  const handleAuthorHover = useCallback(() => {
    prefetchUser(author.username);
  }, [author.username, prefetchUser]);

  const handleCastClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    // Prefetch immediately on click as well (in case hover didn't happen)
    prefetchThread(cast.hash);
    router.push(`/cast/${cast.hash}`);
  };

  return (
    <article
      onClick={handleCastClick}
      onMouseEnter={handleMouseEnter}
      className="py-3 hover:bg-system-secondary-background/30 transition-colors cursor-pointer"
    >
      <div className="px-4">
        <div className="flex gap-3">
        <div onMouseEnter={handleAuthorHover}>
          <UserAvatar
            username={author.username}
            pfpUrl={author.pfp_url}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/${author.username}`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleAuthorHover}
              className="font-semibold text-system-label truncate hover:underline"
            >
              {author.display_name}
            </Link>
            <Link
              href={`/${author.username}`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleAuthorHover}
              className="text-system-secondary-label hover:underline"
            >
              @{author.username}
            </Link>
            <span className="text-system-tertiary-label">·</span>
            <span className="text-system-secondary-label text-sm">
              {formatRelativeTime(timestamp)}
            </span>
          </div>

          {cast.parent_author?.fid && showThread && (
            <p className="text-sm text-system-secondary-label mt-0.5">
              Replying to a thread
            </p>
          )}

          <div className="mt-1">
            <CastText text={text} mentionedProfiles={cast.mentioned_profiles} />
          </div>

          {embeds && embeds.length > 0 && (
            <div className="mt-3">
              <EmbedRouter embeds={embeds} />
            </div>
          )}

          <div className="mt-2 pb-3">
            {actionError && (
              <p className="text-xs text-red-600 mb-1" onClick={(e) => e.stopPropagation()}>
                {actionError}
              </p>
            )}
            <ReactionBar
              repliesCount={replies.count}
              recastsCount={reactions.recasts_count}
              likesCount={reactions.likes_count}
              liked={viewer_context?.liked}
              recasted={viewer_context?.recasted}
              onLike={() => submitReaction('like')}
              onRecast={() => submitReaction('recast')}
            />
          </div>
        </div>
        </div>
      </div>
      <div className="border-b border-system-separator"></div>
    </article>
  );
}

interface CastTextProps {
  text: string;
  mentionedProfiles?: Array<{ username: string; fid: number }>;
}

function CastText({ text, mentionedProfiles = [] }: CastTextProps) {
  // Parse URLs and mentions
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const mentionRegex = /@(\w+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all URLs and mentions with their positions
  const matches: Array<{ index: number; length: number; type: 'url' | 'mention'; value: string }> = [];

  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length, type: 'url', value: match[0] });
  }
  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length, type: 'mention', value: match[1] });
  }

  // Sort by position
  matches.sort((a, b) => a.index - b.index);

  // Build parts
  for (const m of matches) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }

    if (m.type === 'url') {
      parts.push(
        <a
          key={m.index}
          href={m.value}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-brand-primary hover:underline"
        >
          {truncateUrl(m.value)}
        </a>
      );
    } else if (m.type === 'mention') {
      const mentioned = mentionedProfiles.find(
        (p) => p.username.toLowerCase() === m.value.toLowerCase()
      );
      parts.push(
        <Link
          key={m.index}
          href={`/${mentioned?.username || m.value}`}
          onClick={(e) => e.stopPropagation()}
          className="text-brand-primary hover:underline"
        >
          @{m.value}
        </Link>
      );
    }

    lastIndex = m.index + m.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <p className="text-system-label whitespace-pre-wrap break-words">
      {parts.length > 0 ? parts : text}
    </p>
  );
}

function truncateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > 30 ? display.slice(0, 30) + '...' : display;
  } catch {
    return url.length > 30 ? url.slice(0, 30) + '...' : url;
  }
}
