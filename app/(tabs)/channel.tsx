import { FlashList } from '@shopify/flash-list'
import _ from 'lodash'
import React, { useCallback } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import Cast from '../../components/Cast'
import { useRoute } from '@react-navigation/native'
// import { useLatestCasts } from 'farcasterkit-react-native'
import { useLatestCasts } from '../../hooks/useLatestsCasts'
import useAppContext from '../../hooks/useAppContext'
import { filterCastsBasedOnChannels, filterFeedBasedOnFID, filterCastsToMute } from '../../utils/functions'

const ChannelScreen = () => {
  const route = useRoute<any>()
  const { filter } = useAppContext()
  let feed: any[] = []
  const { type, parent_url, fid } = route.params


  const { casts, isLoading, loadMore, isReachingEnd } =
    parent_url && parent_url.length > 0
      ? useLatestCasts(type, parent_url)
      : (fid ? useLatestCasts(type, undefined, fid)
      : useLatestCasts(type))

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore()
    }
  }, [isReachingEnd, loadMore])

  // if type is channel and fid is present than filter casts by fid than filterFeedBasedOnFID with filter
  if (type === "channel" && fid) {
    let filteredCasts = filterFeedBasedOnFID(casts, filter.lowerFid, filter.upperFid)
    if(filter.showChannels?.length > 0) {
      filteredCasts = filterCastsBasedOnChannels(filteredCasts, filter.showChannels)
    }
    if(filter.mutedChannels?.length > 0) {
      filteredCasts = filterCastsToMute(filteredCasts, filter.mutedChannels)
    }
    feed = filteredCasts
  } else {
    feed = casts
  }

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={styles.flashList}
        data={feed}
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
