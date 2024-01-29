import { FlashList } from '@shopify/flash-list'
import _ from 'lodash'
import React, { useCallback } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { useLatestCasts } from 'farcasterkit-react-native'
import Cast from '../components/Cast'

const GuestScreen = () => {
  // TODO: edit useLatestCasts logic so it adds dyanmic fid and not mine as static
  const { casts, isLoading, loadMore, isReachingEnd } = useLatestCasts()

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore()
    }
  }, [isReachingEnd, loadMore])

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={styles.flashList}
        data={casts}
        renderItem={({ item }) => <Cast key={item.hash} cast={item} />}
        keyExtractor={(item) => item.hash}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          isLoading && !isReachingEnd ? (
            <ActivityIndicator size="large" color="#000000" />
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  flashList: {
    backgroundColor: '#fff',
  },
})

export default GuestScreen
