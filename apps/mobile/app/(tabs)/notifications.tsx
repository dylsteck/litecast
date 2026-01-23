import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform, StatusBar, ActivityIndicator, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { useNotifications } from '@litecast/hooks';
import type { NeynarNotification } from '@litecast/types';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import Notification from '../../components/Notification';
import { EmptyState } from '../../components/EmptyState';
import { SystemColors } from '../../constants/Colors';

const NotificationsScreen = () => {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  
  // Fetch priority notifications (mentions and replies)
  const { data: priorityData, isLoading: priorityLoading } = 
    useNotifications({ fid: DEFAULT_FID, type: ['mentions', 'replies'] });
  
  // Fetch all notifications
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = 
    useNotifications({ fid: DEFAULT_FID });

  const notifications = useMemo(() => {
    const allNotifications = data?.pages.flatMap(page => page.notifications) ?? [];
    const priorityNotifications = priorityData?.pages.flatMap(page => page.notifications) ?? [];
    
    // Combine and deduplicate: priority first, then others
    const prioritySet = new Set(priorityNotifications.map(n => `${n.type}-${n.most_recent_timestamp}`));
    const otherNotifications = allNotifications.filter(
      n => !prioritySet.has(`${n.type}-${n.most_recent_timestamp}`)
    );
    
    // Sort priority notifications by unseen first, then by timestamp
    const sortedPriority = [...priorityNotifications].sort((a, b) => {
      const aUnseen = a.seen === false || a.seen === undefined;
      const bUnseen = b.seen === false || b.seen === undefined;
      if (aUnseen !== bUnseen) {
        return aUnseen ? -1 : 1;
      }
      return new Date(b.most_recent_timestamp).getTime() - new Date(a.most_recent_timestamp).getTime();
    });
    
    // Sort other notifications by unseen first, then by timestamp
    const sortedOthers = otherNotifications.sort((a, b) => {
      const aUnseen = a.seen === false || a.seen === undefined;
      const bUnseen = b.seen === false || b.seen === undefined;
      if (aUnseen !== bUnseen) {
        return aUnseen ? -1 : 1;
      }
      return new Date(b.most_recent_timestamp).getTime() - new Date(a.most_recent_timestamp).getTime();
    });
    
    return [...sortedPriority, ...sortedOthers];
  }, [data, priorityData]);

  const isLoadingNotifications = isLoading || priorityLoading;

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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <LegendList
          data={notifications}
          renderItem={({ item }: { item: NeynarNotification }) => <Notification notification={item} />}
          keyExtractor={(item: NeynarNotification, index: number) => `${item.most_recent_timestamp}-${index}`}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          recycleItems
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={SystemColors.secondaryLabel} style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={() =>
            !isLoadingNotifications ? (
              <EmptyState 
                icon="notifications-off-outline"
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
    backgroundColor: SystemColors.background,
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
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
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
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
      zIndex: 1,
    },
    default: {},
  }),
  container: {
    backgroundColor: SystemColors.background,
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  headerTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 28,
    fontWeight: '700',
    color: SystemColors.label,
    letterSpacing: -0.4,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: SystemColors.background,
  },
  errorText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  errorSubtext: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default NotificationsScreen;

