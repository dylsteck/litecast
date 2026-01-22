'use client';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useNotifications } from '@litecast/hooks';
import { Notification } from './Notification';
import { EmptyState } from './EmptyState';

const DEMO_FID = 3;

export default function NotificationsContent() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications({
    fid: DEMO_FID,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.notifications) || [];
    return all.sort((a, b) => {
      const priorityOrder = ['mentions', 'replies', 'follows', 'likes', 'recasts'];
      const aPriority = priorityOrder.indexOf(a.type);
      const bPriority = priorityOrder.indexOf(b.type);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.most_recent_timestamp).getTime() - new Date(a.most_recent_timestamp).getTime();
    });
  }, [data]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
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
    return <NotificationsSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          title="No notifications yet"
          description="When you get notifications, they will appear here."
          icon={<BellIcon className="w-8 h-8 text-system-tertiary-label" />}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="px-4 py-3 font-semibold text-lg text-system-label border-b border-system-separator">
        Notifications
      </h1>
      {notifications.map((notification, index) => (
        <Notification key={`${notification.type}-${index}`} notification={notification} />
      ))}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-system-separator">
        <div className="w-32 h-6 bg-system-secondary-background rounded" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 p-4 border-b border-system-separator">
          <div className="w-8 h-8 bg-system-secondary-background rounded-full" />
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <div className="w-8 h-8 bg-system-secondary-background rounded-full" />
              <div className="w-8 h-8 bg-system-secondary-background rounded-full" />
            </div>
            <div className="w-48 h-4 bg-system-secondary-background rounded mb-1" />
            <div className="w-full h-4 bg-system-secondary-background rounded" />
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
