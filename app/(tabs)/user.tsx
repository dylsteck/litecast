import { LegendList } from '@legendapp/list';
import React from 'react';
import { CastCard } from '../../components/CastCard';
import { FeedState, Screen } from '../../components/Screen';
import { ProfileCard } from '../../components/ProfileCard';
import { SignInCard } from '../../components/SignInCard';
import { useUserCasts } from '../../hooks/useUserCasts';
import { useSession } from '../../providers/SessionProvider';

export default function ProfileScreen() {
  const { user, isSignedIn } = useSession();
  const casts = useUserCasts(user?.fid);

  if (!isSignedIn || !user) {
    return (
      <Screen>
        <SignInCard />
      </Screen>
    );
  }

  return (
    <Screen>
      <LegendList
        data={casts.casts}
        recycleItems
        keyExtractor={(item) => item.hash}
        ListHeaderComponent={<ProfileCard user={user} />}
        renderItem={({ item }) => <CastCard cast={item} />}
        onEndReached={() => {
          if (casts.hasNextPage) void casts.fetchNextPage();
        }}
        ListEmptyComponent={
          <FeedState
            loading={casts.isLoading}
            error={casts.error as Error | null}
            isEmpty
            emptyTitle="No casts yet"
          />
        }
      />
    </Screen>
  );
}
