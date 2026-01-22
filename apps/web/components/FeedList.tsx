'use client';

import { useCallback, useRef, useEffect } from 'react';
import type { NeynarCast } from '@litecast/types';
import { Cast } from './Cast';
import { EmptyState } from './EmptyState';

interface FeedListProps {
  casts: NeynarCast[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FeedList({
  casts,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyTitle = 'No casts yet',
  emptyDescription = 'When there are casts, they will appear here.',
}: FeedListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleObserver]);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (casts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<CastIcon className="w-8 h-8 text-system-tertiary-label" />}
      />
    );
  }

  return (
    <div>
      {casts.map((cast) => (
        <Cast key={cast.hash} cast={cast} />
      ))}

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-system-separator">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-system-secondary-background rounded-full" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-24 h-4 bg-system-secondary-background rounded" />
                <div className="w-16 h-4 bg-system-secondary-background rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-system-secondary-background rounded" />
                <div className="w-3/4 h-4 bg-system-secondary-background rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center">
      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function CastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}
