import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity } from 'react-native'
import { LegendList } from '@legendapp/list'
import { FontAwesome } from '@expo/vector-icons'
import { GlassView } from 'expo-glass-effect'
import { Button, Host, ContentUnavailableView } from '@expo/ui/swift-ui'
import ComposeCast from '../../components/ComposeCast'
import Cast from '../../components/Cast'
import { useChannelFeed } from '../../hooks/queries/useChannelFeed'

const TabOneScreen = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error, refetch } = useChannelFeed('trending')

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <GlassView tint="light" style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>Unable to load trending feed</Text>
            <Text style={styles.errorSubtext}>
              {error.message === 'Neynar API key not configured' 
                ? 'API key is not configured'
                : 'Check your connection and try again'}
            </Text>
            <Host style={{ width: 140 }}>
              <Button
                variant="glassProminent"
                systemImage="arrow.clockwise"
                onPress={() => refetch()}
              >
                Try Again
              </Button>
            </Host>
          </GlassView>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LegendList
          data={casts}
          renderItem={({ item }) => <Cast cast={item} />}
          keyExtractor={(item) => item.hash}
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
              <Host style={styles.emptyContainer}>
                <ContentUnavailableView
                  title="No trending casts"
                  systemImage="chart.line.downtrend.xyaxis"
                  description="Check back later for trending content"
                />
              </Host>
            ) : null
          }
        />
        <ComposeCast />
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
  emptyContainer: {
    flex: 1,
  },
})

export default TabOneScreen
