'use client';

import { useState, useMemo } from 'react';
import { useUser, useUserCasts, useUserReactions } from '@litecast/hooks';
import { ProfileHeader } from './ProfileHeader';
import { TabPills } from './TabPills';
import { FeedList } from './FeedList';
import { EmptyState } from './EmptyState';

const TABS = [
  { id: 'casts', label: 'Casts' },
  { id: 'replies', label: 'Replies' },
  { id: 'likes', label: 'Likes' },
];

interface UserProfileContentProps {
  username: string;
}

export default function UserProfileContent({ username }: UserProfileContentProps) {
  const [activeTab, setActiveTab] = useState('casts');

  const { data: userData, isLoading: userLoading } = useUser(username);
  const user = userData?.user;

  const castsQuery = useUserCasts({ fid: user?.fid || 0, includeReplies: false });
  const repliesQuery = useUserCasts({ fid: user?.fid || 0, includeReplies: true });
  const likesQuery = useUserReactions({ fid: user?.fid || 0, type: 'likes' });

  const casts = useMemo(() => {
    return castsQuery.data?.pages.flatMap((page) => page.casts) || [];
  }, [castsQuery.data]);

  // Filter to only show replies (casts that have a parent)
  const replies = useMemo(() => {
    const allCasts = repliesQuery.data?.pages.flatMap((page) => page.casts) || [];
    return allCasts.filter((cast) => cast.parent_hash);
  }, [repliesQuery.data]);

  const likedCasts = useMemo(() => {
    return likesQuery.data?.pages.flatMap((page) => page.reactions?.map((r: any) => r.cast)) || [];
  }, [likesQuery.data]);

  if (userLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description={`The user @${username} doesn't exist.`}
      />
    );
  }

  return (
    <div>
      <ProfileHeader user={user} />

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-system-separator p-3">
        <TabPills tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'casts' && (
        <FeedList
          casts={casts}
          isLoading={castsQuery.isLoading}
          hasNextPage={castsQuery.hasNextPage}
          isFetchingNextPage={castsQuery.isFetchingNextPage}
          fetchNextPage={castsQuery.fetchNextPage}
          emptyTitle="No casts yet"
          emptyDescription={`@${username} hasn't posted any casts.`}
        />
      )}

      {activeTab === 'replies' && (
        <FeedList
          casts={replies}
          isLoading={repliesQuery.isLoading}
          hasNextPage={repliesQuery.hasNextPage}
          isFetchingNextPage={repliesQuery.isFetchingNextPage}
          fetchNextPage={repliesQuery.fetchNextPage}
          emptyTitle="No replies yet"
          emptyDescription={`@${username} hasn't replied to any casts.`}
        />
      )}

      {activeTab === 'likes' && (
        <FeedList
          casts={likedCasts}
          isLoading={likesQuery.isLoading}
          hasNextPage={likesQuery.hasNextPage}
          isFetchingNextPage={likesQuery.isFetchingNextPage}
          fetchNextPage={likesQuery.fetchNextPage}
          emptyTitle="No likes yet"
          emptyDescription={`@${username} hasn't liked any casts.`}
        />
      )}
    </div>
  );
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
    </div>
  );
}
