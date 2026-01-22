'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const CastDetailContent = dynamic(() => import('../../../components/CastDetailContent'), {
  ssr: false,
  loading: () => <CastDetailSkeleton />,
});

export default function CastDetailPage() {
  const params = useParams();
  const hash = params.hash as string;

  return <CastDetailContent hash={hash} />;
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
