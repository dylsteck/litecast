import { FlashList } from '@shopify/flash-list'
import _ from 'lodash'
import React, { useCallback, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { useLatestCasts } from 'farcasterkit-react-native'
import Cast from '../components/Cast'
import useAppContext from '../hooks/useAppContext'

const GuestScreen = () => {
  // TODO: edit useLatestCasts logic so it adds dyanmic fid and not mine as static
  const { casts, isLoading, loadMore, isReachingEnd } = useLatestCasts()
  const { fid, filter, setFid } = useAppContext()

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore()
    }
  }, [isReachingEnd, loadMore])

  console.log("CASTS ", casts)
  return (
    <View style={styles.container}>
      {casts && casts?.length > 0 && (
        <FlashList
          contentContainerStyle={styles.flashList}
          data={casts}
          renderItem={({ item, index }) => <Cast key={index} cast={item} />}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          estimatedItemSize={100}
          ListFooterComponent={() =>
            isLoading && !isReachingEnd ? (
              <ActivityIndicator size="large" color="#000000" />
            ) : null
          }
        />
      )}
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
