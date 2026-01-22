'use client';

import dynamic from 'next/dynamic';

const ExploreContent = dynamic(() => import('../../components/ExploreContent'), {
  ssr: false,
  loading: () => <ExploreSkeleton />,
});

export default function ExplorePage() {
  return <ExploreContent />;
}

function ExploreSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="sticky top-0 z-40 bg-white border-b border-system-separator p-3">
        <div className="w-full h-10 bg-system-secondary-background rounded-lg" />
      </div>
      <div className="p-4">
        <div className="w-32 h-5 bg-system-secondary-background rounded mb-3" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-4 h-4 bg-system-secondary-background rounded" />
              <div className="w-24 h-4 bg-system-secondary-background rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
