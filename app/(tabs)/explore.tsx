import { LegendList } from '@legendapp/list';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CastCard } from '../../components/CastCard';
import { FeedState, Screen } from '../../components/Screen';
import { TabPills } from '../../components/TabPills';
import { SystemColors } from '../../constants/Colors';
import { useAllChannels } from '../../hooks/useChannel';
import { useSearch } from '../../hooks/useSearch';
import { displayName, handle, type Channel, type User } from '../../lib/farcaster';

type ExploreTab = 'search' | 'channels';

export default function ExploreScreen() {
  const [tab, setTab] = useState<ExploreTab>('search');
  const [q, setQ] = useState('');
  const search = useSearch(q);
  const channels = useAllChannels();

  return (
    <Screen>
      <TabPills
        tabs={[
          { id: 'search', label: 'Search' },
          { id: 'channels', label: 'Channels' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />
      {tab === 'search' ? (
        <>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search casts, people, channels"
            placeholderTextColor={SystemColors.tertiaryLabel}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q.trim().length === 0 ? (
            <FeedState emptyTitle="Search Farcaster" emptySubtitle="People, channels, and casts" isEmpty />
          ) : (
            <LegendList
              data={search.casts.data ?? []}
              recycleItems
              keyExtractor={(item) => item.hash}
              ListHeaderComponent={
                <View>
                  {(search.users.data ?? []).slice(0, 5).map((user) => (
                    <UserRow key={user.fid} user={user} />
                  ))}
                  {(search.channels.data ?? []).slice(0, 4).map((channel) => (
                    <ChannelRow key={channel.key} channel={channel} />
                  ))}
                </View>
              }
              renderItem={({ item }) => <CastCard cast={item} />}
              ListEmptyComponent={
                search.casts.isLoading ? (
                  <FeedState loading />
                ) : (
                  <FeedState isEmpty emptyTitle="No results" />
                )
              }
            />
          )}
        </>
      ) : (
        <LegendList
          data={channels.data ?? []}
          recycleItems
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => <ChannelRow channel={item} />}
          ListEmptyComponent={
            <FeedState
              loading={channels.isLoading}
              error={channels.error as Error | null}
              isEmpty={!channels.isLoading}
              emptyTitle="No channels"
            />
          }
        />
      )}
    </Screen>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <Pressable
      onPress={() => router.push(user.username ? `/${user.username}` : `/fids/${user.fid}`)}
      style={styles.row}
    >
      <Image source={{ uri: user.pfp?.url }} style={styles.pfp} />
      <View>
        <Text style={styles.name}>{displayName(user)}</Text>
        <Text style={styles.sub}>{handle(user)}</Text>
      </View>
    </Pressable>
  );
}

function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <Pressable onPress={() => router.push(`/channel/${channel.key}`)} style={styles.row}>
      {channel.imageUrl ? <Image source={{ uri: channel.imageUrl }} style={styles.pfp} /> : <View style={styles.pfp} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>/{channel.key}</Text>
        <Text numberOfLines={1} style={styles.sub}>
          {channel.description || channel.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: SystemColors.secondaryBackground,
    fontSize: 16,
    color: SystemColors.label,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  pfp: { width: 40, height: 40, borderRadius: 20, backgroundColor: SystemColors.secondaryBackground },
  name: { fontSize: 16, fontWeight: '600', color: SystemColors.label },
  sub: { fontSize: 13, color: SystemColors.secondaryLabel, marginTop: 2 },
});
