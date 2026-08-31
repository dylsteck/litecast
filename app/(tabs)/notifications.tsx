import { LegendList } from '@legendapp/list';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { NotificationRow } from '../../components/NotificationRow';
import { FeedState, Screen } from '../../components/Screen';
import { SignInCard } from '../../components/SignInCard';
import { TabPills } from '../../components/TabPills';
import { useInbox } from '../../hooks/useInbox';
import { useNotifications } from '../../hooks/useNotifications';
import { useSession } from '../../providers/SessionProvider';
import { StyleSheet, View } from 'react-native';
import { SystemColors } from '../../constants/Colors';

type InboxTab = 'notifications' | 'messages';

export default function InboxScreen() {
  const { isSignedIn } = useSession();
  const [tab, setTab] = useState<InboxTab>('notifications');
  const notifications = useNotifications('all');
  const inbox = useInbox();

  return (
    <Screen>
      <TabPills
        tabs={[
          { id: 'notifications', label: 'Notifications' },
          { id: 'messages', label: 'Messages' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />
      {!isSignedIn ? (
        <SignInCard compact />
      ) : tab === 'notifications' ? (
        <LegendList
          data={notifications.notifications}
          recycleItems
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationRow group={item} />}
          onEndReached={() => {
            if (notifications.hasNextPage) void notifications.fetchNextPage();
          }}
          ListEmptyComponent={
            <FeedState
              loading={notifications.isLoading}
              error={notifications.error as Error | null}
              isEmpty
              emptyTitle="All caught up"
              emptySubtitle="No notifications"
            />
          }
        />
      ) : (
        <LegendList
          data={inbox.data ?? []}
          recycleItems
          keyExtractor={(item) => item.conversationId}
          renderItem={({ item }) => (
            <View style={styles.convo}>
              <Text style={styles.name}>{item.name || item.participants?.[0]?.displayName || 'Conversation'}</Text>
              <Text numberOfLines={1} style={styles.preview}>
                {item.lastMessage?.text || 'Direct cast'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <FeedState
              loading={inbox.isLoading}
              error={inbox.error as Error | null}
              isEmpty
              emptyTitle="No messages"
              emptySubtitle="Direct casts appear here"
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  convo: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  name: { fontSize: 16, fontWeight: '600', color: SystemColors.label },
  preview: { marginTop: 4, fontSize: 14, color: SystemColors.secondaryLabel },
});
