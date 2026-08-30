import { LegendList } from '@legendapp/list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { CastCard } from '../components/CastCard';
import { PageHeader } from '../components/PageHeader';
import { ProfileCard } from '../components/ProfileCard';
import { FeedState, Screen } from '../components/Screen';
import { useUserByUsername } from '../hooks/useUser';
import { useUserCasts } from '../hooks/useUserCasts';

const RESERVED = new Set(['casts', 'fids', 'channel', 'guest', 'index', 'search']);

export default function UsernameProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const user = useUserByUsername(username && !RESERVED.has(username) ? username : undefined);
  const casts = useUserCasts(user.data?.fid);

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
