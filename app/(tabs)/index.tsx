import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { CastCard } from '../../components/CastCard';
import { ComposeCast } from '../../components/ComposeCast';
import { FeedState, Screen } from '../../components/Screen';
import { TabPills } from '../../components/TabPills';
import { useDiscoverFeed } from '../../hooks/useDiscoverFeed';
import { useRankedFeed } from '../../hooks/useFeed';
import { type Cast, type FeedItem } from '../../lib/farcaster';
import { useSession } from '../../providers/SessionProvider';
import { SystemColors } from '../../constants/Colors';

type HomeTab = 'foryou' | 'following' | 'discover';

export default function HomeScreen() {
  const { isSignedIn, views } = useSession();
  const [tab, setTab] = useState<HomeTab>(isSignedIn ? 'foryou' : 'discover');

  useEffect(() => {
    setTab(isSignedIn ? 'foryou' : 'discover');
  }, [isSignedIn]);

  const home = useRankedFeed('home');
  const following = useRankedFeed('following');
  const discover = useDiscoverFeed();

  const tabs = useMemo(
    () =>
      isSignedIn
        ? [
            { id: 'foryou' as const, label: 'For You' },
            { id: 'following' as const, label: 'Following' },
          ]
        : [{ id: 'discover' as const, label: 'Discover' }],
    [isSignedIn],
  );

  const ranked = tab === 'following' ? following : home;
  const usingRanked = isSignedIn && tab !== 'discover';
  const casts: Cast[] = usingRanked ? ranked.items.map((item) => item.cast) : discover.casts;
  const items: FeedItem[] = usingRanked ? ranked.items : [];

  const refreshing = usingRanked ? ranked.isRefetching : discover.isRefetching;
  const loading = usingRanked ? ranked.isLoading : discover.isLoading;
  const error = usingRanked ? ranked.error : discover.error;

  const onEndReached = useCallback(() => {
    if (usingRanked && ranked.hasNextPage && !ranked.isFetchingNextPage) {
      void ranked.fetchNextPage();
    }
  }, [ranked, usingRanked]);

  return (
    <Screen>
      <TabPills tabs={tabs} activeTab={tab} onTabChange={setTab} variant="static" align="left" />
      {loading || error || casts.length === 0 ? (
        <FeedState
          loading={loading}
          error={error as Error | null}
          isEmpty={!loading && casts.length === 0}
          emptyTitle={tab === 'following' ? 'No following feed' : 'No posts yet'}
          emptySubtitle={
            isSignedIn
              ? 'Pull to refresh'
              : 'Guest Discover mixes recent casts from the network. Sign in for ranked For You.'
          }
          onRetry={() => (usingRanked ? ranked.refetch() : discover.refetch())}
        />
      ) : (
        <LegendList
          data={casts}
          recycleItems
          keyExtractor={(item) => item.hash}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={() => (usingRanked ? ranked.refetch() : discover.refetch())}
              tintColor={SystemColors.secondaryLabel}
            />
          }
          renderItem={({ item, index }) => (
            <CastCard
              cast={item}
              reason={items[index]?.meta?.includeReason?.type}
              onView={() =>
                views.track({
                  hash: item.hash,
                  feed: tab,
                  position: index,
                  reason: items[index]?.meta?.includeReason?.type,
                })
              }
            />
          )}
        />
      )}
      <ComposeCast />
    </Screen>
  );
}
