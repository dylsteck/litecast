import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Platform, StatusBar, ActivityIndicator, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import { NotificationType, NeynarNotification } from '../../lib/neynar/types';
import Notification from '../../components/Notification';
import { TabPills } from '../../components/TabPills';
import { EmptyState } from '../../components/EmptyState';

type TabType = 'all' | NotificationType;

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'replies', label: 'Replies' },
  { id: 'likes', label: 'Likes' },
  { id: 'recasts', label: 'Recasts' },
  { id: 'follows', label: 'Follows' },
];

const NotificationsScreen = () => {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const filterTypes = activeTab === 'all' ? undefined : [activeTab as NotificationType];
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = 
    useNotifications(DEFAULT_FID, filterTypes);

  const notifications = useMemo(() => {
    return data?.pages.flatMap(page => page.notifications) ?? [];
  }, [data]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.wrapper}>
        {showGuardrails && (
          <>
            <View style={styles.guardrailLeft} />
            <View style={styles.guardrailRight} />
          </>
        )}
        <View style={styles.container}>
          <TabPills 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <LegendList
          data={notifications}
          renderItem={({ item }: { item: NeynarNotification }) => <Notification notification={item} />}
          keyExtractor={(item: NeynarNotification, index: number) => `${item.most_recent_timestamp}-${index}`}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          recycleItems
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator size="large" color="#000000" style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={() =>
            !isLoading ? (
              <EmptyState 
                icon="bell-slash-o"
                title="All caught up!"
                subtitle="No notifications to show"
              />
            ) : null
          }
        />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  guardrailLeft: Platform.select({
    web: {
      position: 'absolute' as const,
      left: 'calc(50% - 300px)' as any,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      zIndex: 1,
    },
    default: {},
  }),
  guardrailRight: Platform.select({
    web: {
      position: 'absolute' as const,
      right: 'calc(50% - 300px)' as any,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      zIndex: 1,
    },
    default: {},
  }),
  container: {
    backgroundColor: '#fff',
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen;

