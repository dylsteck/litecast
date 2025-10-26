import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Platform, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LegendList } from '@legendapp/list';
import { BlurView } from 'expo-blur';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import { NotificationType } from '../../lib/neynar/types';
import Notification from '../../components/Notification';

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              {activeTab === tab.id ? (
                <BlurView
                  intensity={80}
                  tint="light"
                  style={[styles.tab, styles.activeTab]}
                >
                  <Text style={styles.activeTabText}>
                    {tab.label}
                  </Text>
                </BlurView>
              ) : (
                <View style={styles.tab}>
                  <Text style={styles.tabText}>
                    {tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No notifications</Text>
              </View>
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
  tabsContainer: {
    maxHeight: 60,
    paddingVertical: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.88)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '700',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;

