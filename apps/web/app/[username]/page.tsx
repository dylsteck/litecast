'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const UserProfileContent = dynamic(() => import('../../components/UserProfileContent'), {
  ssr: false,
  loading: () => <ProfileSkeleton />,
});

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return <UserProfileContent username={username} />;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-6 border-b border-system-separator">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-system-secondary-background rounded-full" />
          <div className="flex-1">
            <div className="w-32 h-6 bg-system-secondary-background rounded mb-2" />
            <div className="w-24 h-4 bg-system-secondary-background rounded" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-full h-4 bg-system-secondary-background rounded" />
          <div className="w-2/3 h-4 bg-system-secondary-background rounded" />
        </div>
      </div>
      <div className="p-3 border-b border-system-separator">
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-system-secondary-background rounded-full" />
          <div className="w-16 h-8 bg-system-secondary-background rounded-full" />
        </div>
      </div>
    </div>
  );
}
