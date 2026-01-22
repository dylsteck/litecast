'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useThread } from '@litecast/hooks';
import { formatDateTime } from '@litecast/utils';
import { UserAvatar } from './UserAvatar';
import { Cast } from './Cast';
import { EmptyState } from './EmptyState';
import { EmbedRouter } from './embeds/EmbedRouter';

interface CastDetailContentProps {
  hash: string;
}

export default function CastDetailContent({ hash }: CastDetailContentProps) {
  const { data, isLoading } = useThread(hash);
  const conversation = data?.conversation;

  const mainCast = useMemo(() => {
    if (!conversation?.cast) return null;
    return conversation.cast;
  }, [conversation]);

  const replies = useMemo(() => {
    if (!conversation?.cast?.direct_replies) return [];
    return conversation.cast.direct_replies;
  }, [conversation]);

  if (isLoading) {
    return <CastDetailSkeleton />;
  }

  if (!mainCast) {
    return (
      <EmptyState
        title="Cast not found"
        description="This cast may have been deleted or doesn't exist."
      />
    );
  }

  const { author, text, timestamp, embeds, reactions, replies: repliesCount, viewer_context } = mainCast;

  return (
    <div>
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-system-separator px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-system-label hover:text-brand-primary">
          <BackIcon className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>
      </div>

      <article className="py-4">
        <div className="px-4">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar username={author.username} pfpUrl={author.pfp_url} size="lg" />
            <div>
              <p className="font-semibold text-system-label">{author.display_name}</p>
              <p className="text-system-secondary-label">@{author.username}</p>
            </div>
          </div>

          <div className="mb-3">
            <CastText text={text} mentionedProfiles={mainCast.mentioned_profiles} />
          </div>

          {embeds && embeds.length > 0 && (
            <div className="mb-3">
              <EmbedRouter embeds={embeds} />
            </div>
          )}

          <p className="text-sm text-system-secondary-label mb-3">
            {formatDateTime(timestamp)}
          </p>
        </div>

        <div className="mx-4 border-b border-system-separator mb-3"></div>

        <div className="px-4">
          <div className="flex items-center gap-4 py-3 text-sm">
            <span>
              <strong className="text-system-label">{repliesCount.count}</strong>
              <span className="text-system-secondary-label"> Replies</span>
            </span>
            <span>
              <strong className="text-system-label">{reactions.recasts_count}</strong>
              <span className="text-system-secondary-label"> Recasts</span>
            </span>
            <span>
              <strong className="text-system-label">{reactions.likes_count}</strong>
              <span className="text-system-secondary-label"> Likes</span>
            </span>
          </div>
        </div>
        <div className="border-b border-system-separator mx-4"></div>
      </article>

      {replies.length > 0 && (
        <div>
          <div className="px-4 py-3">
            <h2 className="font-semibold text-system-label">Replies</h2>
          </div>
          {replies.map((reply: any) => (
            <Cast key={reply.hash} cast={reply} />
          ))}
        </div>
      )}

      {replies.length === 0 && (
        <EmptyState
          title="No replies yet"
          description="Be the first to reply to this cast."
        />
      )}
    </div>
  );
}

interface CastTextProps {
  text: string;
  mentionedProfiles?: Array<{ username: string; fid: number }>;
}

function CastText({ text, mentionedProfiles = [] }: CastTextProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const mentionRegex = /@(\w+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const matches: Array<{ index: number; length: number; type: 'url' | 'mention'; value: string }> = [];

  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length, type: 'url', value: match[0] });
  }
  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length, type: 'mention', value: match[1] });
  }

  matches.sort((a, b) => a.index - b.index);

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
          className="text-brand-primary hover:underline"
        >
          {m.value}
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
    <p className="text-lg text-system-label whitespace-pre-wrap break-words">
      {parts.length > 0 ? parts : text}
    </p>
  );
}

function CastDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-system-separator">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-system-secondary-background rounded" />
          <div className="w-12 h-5 bg-system-secondary-background rounded" />
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-system-secondary-background rounded-full" />
          <div>
            <div className="w-32 h-5 bg-system-secondary-background rounded mb-1" />
            <div className="w-24 h-4 bg-system-secondary-background rounded" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="w-full h-5 bg-system-secondary-background rounded" />
          <div className="w-full h-5 bg-system-secondary-background rounded" />
          <div className="w-2/3 h-5 bg-system-secondary-background rounded" />
        </div>
      </div>
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
