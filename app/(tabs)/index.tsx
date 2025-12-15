import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, Platform, StatusBar, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LegendList } from '@legendapp/list'
import { FontAwesome } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import ComposeCast from '../../components/ComposeCast'
import Cast from '../../components/Cast'
import { useChannelFeed } from '../../hooks/queries/useChannelFeed'
import { EmptyState } from '../../components/EmptyState'
import { NeynarCast } from '../../lib/neynar/types'

const TabOneScreen = () => {
  const { width } = useWindowDimensions()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error, refetch, isRefetching } = useChannelFeed('trending')
  const showGuardrails = Platform.OS === 'web' && width > 768

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
          <BlurView intensity={20} tint="light" style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>Unable to load trending feed</Text>
            <Text style={styles.errorSubtext}>
              {error.message === 'Neynar API key not configured' 
                ? 'API key is not configured'
                : 'Check your connection and try again'}
            </Text>
            <TouchableOpacity 
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="light" style={styles.retryButton}>
                <FontAwesome name="refresh" size={16} color="#FFF" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </BlurView>
            </TouchableOpacity>
          </BlurView>
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
          <LegendList
            data={casts}
            renderItem={({ item }: { item: NeynarCast }) => <Cast cast={item} />}
            keyExtractor={(item: NeynarCast, index: number) => `${item.hash}-${index}`}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            recycleItems
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                tintColor="#000"
                colors={['#000']}
              />
            }
            ListFooterComponent={() =>
              isFetchingNextPage ? (
                <ActivityIndicator size="large" color="#000" style={styles.loader} />
              ) : null
            }
            ListEmptyComponent={() =>
              !isLoading ? (
                <EmptyState 
                  icon="line-chart"
                  title="No trending casts"
                  subtitle="Check back later for trending content"
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
    padding: 32,
    backgroundColor: '#fff',
  },
  errorCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    maxWidth: 400,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 92, 246, 0.92)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
})

export default TabOneScreen
