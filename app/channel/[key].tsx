import { LegendList } from '@legendapp/list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CastCard } from '../../components/CastCard';
import { PageHeader } from '../../components/PageHeader';
import { FeedState, Screen } from '../../components/Screen';
import { SystemColors } from '../../constants/Colors';
import { useChannel, useChannelCasts } from '../../hooks/useChannel';

export default function ChannelScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const channel = useChannel(key);
  const casts = useChannelCasts(key);

  return (
    <Screen>
      <PageHeader />
      <LegendList
        data={casts.casts}
        recycleItems
        keyExtractor={(item) => item.hash}
        ListHeaderComponent={
          channel.data ? (
            <View style={styles.header}>
              <Text style={styles.name}>/{channel.data.key}</Text>
              {channel.data.description ? <Text style={styles.bio}>{channel.data.description}</Text> : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => <CastCard cast={item} />}
        ListEmptyComponent={
          <FeedState
            loading={casts.isLoading || channel.isLoading}
            error={(casts.error || channel.error) as Error | null}
            isEmpty
            emptyTitle="No casts in this channel"
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 16, gap: 6 },
  name: { fontSize: 24, fontWeight: '600', color: SystemColors.label, letterSpacing: -0.4 },
  bio: { fontSize: 15, lineHeight: 21, color: SystemColors.secondaryLabel },
});
