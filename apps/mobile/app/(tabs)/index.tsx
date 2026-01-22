import React, { useCallback, useMemo, useState } from 'react'
import { View, ActivityIndicator, Text, Platform, StatusBar, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native'
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
  const [activeTab, setActiveTab] = useState<FeedTab>('trending')
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

  // Show loading state
  if (isLoading && casts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} edges={['top', 'bottom']}>
          <TabPills
            tabs={FEED_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="static"
            align="left"
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={SystemColors.secondaryLabel} />
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} edges={['top', 'bottom']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#FFFFFF' }}>
            <View style={{ alignItems: 'center', maxWidth: 280 }}>
              <View style={{ marginBottom: 16 }}>
                <Ionicons name="wifi-outline" size={44} color={SystemColors.tertiaryLabel} />
              </View>
              <Text 
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: 8,
                  textAlign: 'center',
                  fontFamily: Platform.select({
                    ios: 'System',
                    android: 'sans-serif-medium',
                    default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui'
                  }),
                  letterSpacing: -0.2,
                }}
              >
                Unable to load feed
              </Text>
              <Text 
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 21,
                  fontFamily: Platform.select({
                    ios: 'System',
                    android: 'sans-serif',
                    default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui'
                  }),
                  letterSpacing: -0.1,
                }}
              >
                {error.message === 'Neynar API key not configured' 
                  ? 'API key is not configured'
                  : 'Check your connection and try again'}
              </Text>
              <TouchableOpacity 
                onPress={() => refetch()}
                activeOpacity={0.7}
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#000000' }}
              >
                <Text 
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    fontFamily: Platform.select({
                      ios: 'System',
                      android: 'sans-serif-medium',
                      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui'
                    }),
                    letterSpacing: -0.1,
                  }}
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, position: 'relative' }}>
        {showGuardrails && (
          <>
            <View 
              style={Platform.select({
                web: { position: 'absolute', left: 'calc(50% - 300px)', top: 0, bottom: 0, width: 0.5, backgroundColor: '#E5E7EB', zIndex: 1 },
                default: { display: 'none' },
              }) as any}
            />
            <View 
              style={Platform.select({
                web: { position: 'absolute', right: 'calc(50% - 300px)', top: 0, bottom: 0, width: 0.5, backgroundColor: '#E5E7EB', zIndex: 1 },
                default: { display: 'none' },
              }) as any}
            />
          </>
        )}
        <View 
          style={Platform.select({
            web: {
              flex: 1,
              maxWidth: 600,
              alignSelf: 'center',
              width: '100%',
              backgroundColor: '#FFFFFF',
            },
            default: {
              flex: 1,
              backgroundColor: '#FFFFFF',
            },
          }) as any}
        >
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
            onEndReachedThreshold={0.5}
            estimatedItemSize={200}
            recycleItems
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
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
                <ActivityIndicator size="small" color={SystemColors.secondaryLabel} style={{ marginVertical: 20 }} />
              ) : null
            }
            ListEmptyComponent={() =>
              <EmptyState 
                icon="sparkles-outline"
                title={activeTab === 'foryou' ? 'No posts yet' : 'No trending posts'}
                subtitle="Check back later for new content"
              />
            }
          />
          {Platform.OS !== 'web' && <ComposeCast />}
        </View>
        </View>
      </SafeAreaView>
    </View>
  )
}


export default TabOneScreen
