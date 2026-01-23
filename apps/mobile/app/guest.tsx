import React, { useCallback, useMemo } from 'react'
import { View, ActivityIndicator, Text, Platform, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LegendList } from '@legendapp/list'
import { withUniwind } from 'uniwind'
import Cast from '../components/Cast'
import { useFeed } from '@litecast/hooks'
import { DEFAULT_FID } from '../constants/Farcaster'

const StyledSafeAreaView = withUniwind(SafeAreaView)

const GuestScreen = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useFeed(DEFAULT_FID)

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
      <StyledSafeAreaView 
        className="flex-1 bg-white"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        <View className="flex-1 justify-center items-center p-5 bg-white">
          <Text className="text-lg font-bold text-black mb-2">Failed to load feed</Text>
          <Text className="text-sm text-gray-500 text-center">{error.message}</Text>
        </View>
      </StyledSafeAreaView>
    )
  }

  return (
    <StyledSafeAreaView 
      className="flex-1 bg-white"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <View className="flex-1 bg-white justify-between">
        <LegendList
          data={casts}
          renderItem={({ item }) => <Cast cast={item} truncate={true} />}
          keyExtractor={(item) => item.hash}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          recycleItems
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator size="large" color="#000000" className="my-5" />
            ) : null
          }
          ListEmptyComponent={() =>
            !isLoading ? (
              <View className="p-10 items-center">
                <Text className="text-base text-gray-500">No casts to display</Text>
              </View>
            ) : null
          }
        />
      </View>
    </StyledSafeAreaView>
  )
}

export default GuestScreen
