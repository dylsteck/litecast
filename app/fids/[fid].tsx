import { LegendList } from '@legendapp/list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { CastCard } from '../../components/CastCard';
import { PageHeader } from '../../components/PageHeader';
import { ProfileCard } from '../../components/ProfileCard';
import { FeedState, Screen } from '../../components/Screen';
import { useUserByFid } from '../../hooks/useUser';
import { useUserCasts } from '../../hooks/useUserCasts';

export default function FidProfileScreen() {
  const { fid } = useLocalSearchParams<{ fid: string }>();
  const parsed = Number(fid);
  const user = useUserByFid(Number.isFinite(parsed) ? parsed : undefined);
  const casts = useUserCasts(Number.isFinite(parsed) ? parsed : undefined);

  return (
    <Screen>
      <PageHeader />
      {user.data ? (
        <LegendList
          data={casts.casts}
          recycleItems
          keyExtractor={(item) => item.hash}
          ListHeaderComponent={<ProfileCard user={user.data} />}
          renderItem={({ item }) => <CastCard cast={item} />}
          onEndReached={() => {
            if (casts.hasNextPage) void casts.fetchNextPage();
          }}
        />
      ) : (
        <FeedState loading={user.isLoading} error={user.error as Error | null} isEmpty emptyTitle="User not found" />
      )}
    </Screen>
  );
}
