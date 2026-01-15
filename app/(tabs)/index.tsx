import React, { useCallback, useMemo, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, Platform, StatusBar, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LegendList } from '@legendapp/list'
import { Ionicons } from '@expo/vector-icons'
import ComposeCast from '../../components/ComposeCast'
import Cast from '../../components/Cast'
import { useChannelFeed } from '../../hooks/queries/useChannelFeed'
import { useForYouFeed } from '../../hooks/queries/useForYouFeed'
import { EmptyState } from '../../components/EmptyState'
import { NeynarCast } from '../../lib/neynar/types'
import { SystemColors } from '../../constants/Colors'
import { TabPills } from '../../components/TabPills'

type FeedTab = 'foryou' | 'trending'

const FEED_TABS: { id: FeedTab; label: string }[] = [
  { id: 'foryou', label: 'For You' },
  { id: 'trending', label: 'Trending' },
]

const TabOneScreen = () => {
  const { width } = useWindowDimensions()
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou')
  const showGuardrails = Platform.OS === 'web' && width > 768
  
  // For You feed - uses /farcaster/feed/for_you endpoint
  const forYouQuery = useForYouFeed()
  // Trending feed - uses /farcaster/feed/trending endpoint
  const trendingQuery = useChannelFeed('trending')
  
  // Select the active query based on tab
  const activeQuery = activeTab === 'foryou' ? forYouQuery : trendingQuery
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error, refetch, isRefetching } = activeQuery

  // Flatten pages into a single array of casts
  const casts = useMemo(() => {
    return data?.pages.flatMap(page => page.casts) ?? []
  }, [data])

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="wifi-outline" size={44} color={SystemColors.tertiaryLabel} />
            </View>
            <Text style={styles.errorText}>Unable to load feed</Text>
            <Text style={styles.errorSubtext}>
              {error.message === 'Neynar API key not configured' 
                ? 'API key is not configured'
                : 'Check your connection and try again'}
            </Text>
            <TouchableOpacity 
              onPress={() => refetch()}
              activeOpacity={0.7}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
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
          {/* Sticky header tabs */}
          <TabPills
            tabs={FEED_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="static"
            align="left"
          />
          
          <LegendList
            data={casts}
            renderItem={({ item }: { item: NeynarCast }) => <Cast cast={item} truncate={true} />}
            keyExtractor={(item: NeynarCast, index: number) => `${item.hash}-${index}`}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            recycleItems
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                tintColor={SystemColors.secondaryLabel}
                colors={[SystemColors.label]}
              />
            }
            ListFooterComponent={() =>
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={SystemColors.secondaryLabel} style={styles.loader} />
              ) : null
            }
            ListEmptyComponent={() =>
              !isLoading ? (
                <EmptyState 
                  icon="sparkles-outline"
                  title={activeTab === 'foryou' ? 'No posts yet' : 'No trending posts'}
                  subtitle="Check back later for new content"
                />
              ) : null
            }
          />
          {Platform.OS !== 'web' && <ComposeCast />}
        </View>
      </View>
    </SafeAreaView>
  )
}

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
    padding: 32,
    backgroundColor: SystemColors.background,
  },
  errorCard: {
    alignItems: 'center',
    maxWidth: 280,
  },
  errorIconContainer: {
    marginBottom: 16,
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
    marginBottom: 24,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: SystemColors.label,
  },
  retryButtonText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.background,
    letterSpacing: -0.1,
  },
})

export default TabOneScreen
