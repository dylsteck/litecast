'use client';

import dynamic from 'next/dynamic';

const NotificationsContent = dynamic(() => import('../../components/NotificationsContent'), {
  ssr: false,
  loading: () => <NotificationsSkeleton />,
});

export default function NotificationsPage() {
  return <NotificationsContent />;
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
