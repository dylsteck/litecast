import { FlashList } from '@shopify/flash-list'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import Cast from '../../components/Cast'
import { useLatestCasts } from '../../hooks/useLatestsCasts'
import useAppContext from '../../hooks/useAppContext'
import {
  filterCastsBasedOnChannels,
  filterFeedBasedOnFID,
  filterCastsToMute,
} from '../../utils/functions'
import { eventEmitter } from '../../utils/event'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LOCAL_STORAGE_KEYS } from '../../constants/Farcaster'
import { set } from 'lodash'

const ChannelScreen = () => {
  const route = useRoute<any>()
  const { filter, setFilter } = useAppContext()
  const { type, parent_url, fid } = route.params
  const [feed, setFeed] = useState<any[]>([])
  const [isFilterChanged, setIsFilterChanged] = useState(false)

  const { casts, isLoading, loadMore, isReachingEnd } = useLatestCasts(
    type,
    parent_url,
    fid,
  )

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore()
    }
  }, [isReachingEnd, loadMore])

  const filteredCasts = useMemo(() => {
    let filtered = filterFeedBasedOnFID(casts, filter.lowerFid, filter.upperFid);
    if (filter.showChannels.length > 0) {
      filtered = filterCastsBasedOnChannels(filtered, filter.showChannels);
    }
    if (filter.mutedChannels.length > 0) {
      filtered = filterCastsToMute(filtered, filter.mutedChannels);
    }
    if (filter.isPowerBadgeHolder) {
      filtered = filtered.filter((cast: { author: { power_badge: any; }; }) => cast.author?.power_badge);
    }
    // return filtered;
    setFeed(filtered);
  }, [casts, isFilterChanged, filter.lowerFid, filter.upperFid, filter.showChannels, filter.mutedChannels, filter.isPowerBadgeHolder]);

  // useEffect(() => {
  //   setFeed(filteredCasts);
  // }, [isFilterChanged, filteredCasts, casts]);

  // useEffect(() => {
  //   let filteredCasts = filterFeedBasedOnFID(
  //     casts,
  //     filter.lowerFid,
  //     filter.upperFid,
  //   )
  //   if (filter.showChannels.length > 0) {
  //     filteredCasts = filterCastsBasedOnChannels(
  //       filteredCasts,
  //       filter.showChannels,
  //     )
  //   }
  //   if (filter.mutedChannels.length > 0) {
  //     filteredCasts = filterCastsToMute(filteredCasts, filter.mutedChannels)
  //   }
  //   if (filter.isPowerBadgeHolder) {
  //     filteredCasts = filteredCasts.filter(
  //       (cast: { author: { power_badge: any } }) => cast.author?.power_badge,
  //     )
  //   }
  //   setFeed(filteredCasts)
  // }, [isFilterChanged, filter])

  useEffect(() => {
    const handleFilterChange = () => {
      console.log('filter changed')
      setIsFilterChanged((prev) => !prev)
    }

    eventEmitter.on('filterChanged', handleFilterChange)

    return () => {
      eventEmitter.off('filterChanged', handleFilterChange)
    }
  }, [])

  const handleApply = () => {
    let newFilter = {
      lowerFid: 0,
      upperFid: Infinity,
      showChannels: [],
      mutedChannels: [],
      isPowerBadgeHolder: false,
    }
    setFilter(newFilter)
    AsyncStorage.setItem(
      LOCAL_STORAGE_KEYS.FILTERS,
      JSON.stringify(newFilter),
    )
    eventEmitter.emit('filterChanged', newFilter)
  }

  // console.log("FILTER ", JSON.stringify(filter, null, 2))
  return (
    <View style={styles.container}>
      {feed && feed.length > 0 && !isLoading ? (
        <FlashList
          contentContainerStyle={styles.flashList}
          data={feed}
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
      ) : (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '37%',
            alignItems: 'center',
            margin: 30,
          }}
        >
          <Text
            style={{
              color: 'black',
              fontSize: 24,
              marginBottom: 20,
              fontFamily: 'SpaceMono',
            }}
          >
            No casts for the current filter.
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 24,
              marginBottom: 20,
              fontFamily: 'SpaceMono',
            }}
          >
            Try tweaking your filter or head back to the default view by
            resetting?
          </Text>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
  applyButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    height: 126,
    fontFamily: 'SpaceMono',
  },
})

export default React.memo(ChannelScreen)
