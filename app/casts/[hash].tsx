import { LegendList } from '@legendapp/list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { CastCard } from '../../components/CastCard';
import { ComposeCast } from '../../components/ComposeCast';
import { PageHeader } from '../../components/PageHeader';
import { FeedState, Screen } from '../../components/Screen';
import { useThread } from '../../hooks/useThread';

export default function ThreadScreen() {
  const { hash } = useLocalSearchParams<{ hash: string }>();
  const thread = useThread(hash);

  return (
    <Screen>
      <PageHeader />
      {thread.root ? (
        <LegendList
          data={thread.replies}
          recycleItems
          keyExtractor={(item) => item.hash}
          ListHeaderComponent={<CastCard cast={thread.root} truncate={false} />}
          renderItem={({ item }) => <CastCard cast={item} truncate={false} />}
          ListEmptyComponent={
            thread.isLoading ? null : <FeedState isEmpty emptyTitle="No replies" emptySubtitle="Be the first" />
          }
        />
      ) : (
        <FeedState loading={thread.isLoading} error={thread.error as Error | null} isEmpty={!thread.isLoading} emptyTitle="Cast not found" />
      )}
      <ComposeCast parentHash={hash} />
    </Screen>
  );
}
