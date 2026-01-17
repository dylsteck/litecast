import React, { useCallback, useMemo, useState } from 'react'
import { View, ActivityIndicator, Text, Platform, StatusBar, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LegendList } from '@legendapp/list'
import { Ionicons } from '@expo/vector-icons'
import { withUniwind } from 'uniwind'
import ComposeCast from '../../components/ComposeCast'
import Cast from '../../components/Cast'
import { useChannelFeed } from '../../hooks/queries/useChannelFeed'
import { useForYouFeed } from '../../hooks/queries/useForYouFeed'
import { EmptyState } from '../../components/EmptyState'
import { NeynarCast } from '../../lib/neynar/types'
import { SystemColors } from '../../constants/Colors'
import { TabPills } from '../../components/TabPills'

const StyledSafeAreaView = withUniwind(SafeAreaView)

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

  // Show loading state
  if (isLoading && casts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <StyledSafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']} style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
          <TabPills
            tabs={FEED_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="static"
            align="left"
          />
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={SystemColors.secondaryLabel} />
          </View>
        </StyledSafeAreaView>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <StyledSafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']} style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
          <View className="flex-1 justify-center items-center p-8 bg-white">
          <View className="items-center max-w-[280px]">
            <View className="mb-4">
              <Ionicons name="wifi-outline" size={44} color={SystemColors.tertiaryLabel} />
            </View>
            <Text 
              className="text-base font-semibold text-black mb-2 text-center"
              style={{
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
              className="text-sm text-gray-500 text-center mb-6 leading-[21px]"
              style={{
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
              className="px-5 py-2.5 rounded-[20px] bg-black"
            >
              <Text 
                className="text-sm font-semibold text-white"
                style={{
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
        </StyledSafeAreaView>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <StyledSafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']} style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1 relative">
        {showGuardrails && (
          <>
            <View 
              className="absolute left-[calc(50%-300px)] top-0 bottom-0 w-[0.5px] bg-gray-200 z-[1]"
              style={Platform.select({
                web: {},
                default: { display: 'none' },
              })}
            />
            <View 
              className="absolute right-[calc(50%-300px)] top-0 bottom-0 w-[0.5px] bg-gray-200 z-[1]"
              style={Platform.select({
                web: {},
                default: { display: 'none' },
              })}
            />
          </>
        )}
        <View 
          className="flex-1 bg-white"
          style={Platform.select({
            web: {
              maxWidth: 600,
              alignSelf: 'center',
              width: '100%',
            },
          })}
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
      </StyledSafeAreaView>
    </View>
  )
}


export default TabOneScreen
