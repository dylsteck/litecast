import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native'
import { LegendList } from '@legendapp/list'
import ComposeCast from '../../components/ComposeCast'
import Cast from '../../components/Cast'
import { useRoute } from '@react-navigation/native'
import { useChannelFeed, useTrendingFeed } from '@litecast/hooks'
import type { NeynarCast } from '@litecast/types'

const ChannelScreen = () => {
  const route = useRoute()
  const { type, parent_url } = route.params as { type: 'trending' | 'channel'; parent_url?: string }
  
  // Use trending feed for trending type, channel feed otherwise
  const trendingQuery = useTrendingFeed({})
  const channelQuery = useChannelFeed({ parentUrl: parent_url })
  
  // Select the appropriate query based on type
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = 
    type === 'trending' ? trendingQuery : channelQuery

  // Flatten pages into a single array of casts
  const casts = useMemo(() => {
    return data?.pages.flatMap(page => page.casts) ?? []
  }, [data])

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load channel feed</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LegendList
        data={casts}
        renderItem={({ item }: { item: NeynarCast }) => <Cast cast={item} truncate={true} />}
        keyExtractor={(item: NeynarCast) => item.hash}
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
              <Text style={styles.emptyText}>No casts to display</Text>
            </View>
          ) : null
        }
      />
      {Platform.OS !== 'web' && <ComposeCast />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
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
})

export default ChannelScreen
