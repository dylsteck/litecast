import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { LegendList } from '@legendapp/list';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import { NotificationType } from '../../lib/neynar/types';
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TabPills 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <LegendList
          data={notifications}
          renderItem={({ item }) => <Notification notification={item} />}
          keyExtractor={(item, index) => `${item.most_recent_timestamp}-${index}`}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
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

