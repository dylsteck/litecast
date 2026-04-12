'use client';

import { useState, useMemo } from 'react';
import { useForYouFeed, useFeed } from '@litecast/hooks';
import { TabPills } from './TabPills';
import { FeedList } from './FeedList';
import { WebComposeBar } from './WebComposeBar';
import { useLitecastSession } from './LitecastSessionContext';

const DEMO_FID = 3;

const TABS = [
  { id: 'for-you', label: 'For You' },
  { id: 'trending', label: 'Trending' },
];

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState('for-you');
  const { session } = useLitecastSession();
  const feedFid = session?.identity?.fid ?? DEMO_FID;

  const forYouQuery = useForYouFeed(feedFid);
  const trendingQuery = useFeed(feedFid);

  const activeQuery = activeTab === 'for-you' ? forYouQuery : trendingQuery;

  const casts = useMemo(() => {
    return activeQuery.data?.pages.flatMap((page) => page.casts) || [];
  }, [activeQuery.data]);

  return (
    <div>
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-system-separator p-3">
        <TabPills tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <FeedList
        casts={casts}
        isLoading={activeQuery.isLoading}
        hasNextPage={activeQuery.hasNextPage}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        fetchNextPage={activeQuery.fetchNextPage}
        emptyTitle="No casts yet"
        emptyDescription="Follow some people to see their casts here."
      />
      <WebComposeBar />
    </div>
  );
}
