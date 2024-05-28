import { FlashList } from '@shopify/flash-list'
import _ from 'lodash'
import React, { useCallback } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import Cast from '../../components/Cast'
import { useRoute } from '@react-navigation/native'
import { useLatestCasts } from 'farcasterkit-react-native'
const ChannelScreen = () => {
  const route = useRoute<any>()
  const { type, parent_url } = route.params
  const { casts, isLoading, loadMore, isReachingEnd } =
    parent_url && parent_url.length > 0
      ? useLatestCasts(type, parent_url)
      : useLatestCasts(type)

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

export default ChannelScreen
