'use client';

import { useState, useEffect, type ComponentType } from 'react';

export default function HomePage() {
  const [Content, setContent] = useState<ComponentType | null>(null);

  useEffect(() => {
    import('../components/HomeContent').then((mod) => {
      setContent(() => mod.default);
    });
  }, []);

  if (!Content) {
    return <HomeSkeleton />;
  }

  return <Content />;
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-system-separator p-3">
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-system-secondary-background rounded-full" />
          <div className="w-20 h-8 bg-system-secondary-background rounded-full" />
        </div>
      </div>
      <div className="divide-y divide-system-separator">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-system-secondary-background rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-system-secondary-background rounded" />
                <div className="w-full h-4 bg-system-secondary-background rounded" />
                <div className="w-2/3 h-4 bg-system-secondary-background rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
