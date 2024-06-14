import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Cast from '../../components/Cast';
import { useLatestCasts } from '../../hooks/useLatestsCasts';
import useAppContext from '../../hooks/useAppContext';
import { filterCastsBasedOnChannels, filterFeedBasedOnFID, filterCastsToMute } from '../../utils/functions';
import { eventEmitter } from '../../utils/event';

const ChannelScreen = () => {
  const route = useRoute<any>();
  const { filter } = useAppContext();
  const { type, parent_url, fid } = route.params;
  const [feed, setFeed] = useState<any[]>([]);
  const [isFilterChanged, setIsFilterChanged] = useState(false);

  const { casts, isLoading, loadMore, isReachingEnd } = useLatestCasts(type, parent_url, fid);

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore();
    }
  }, [isReachingEnd, loadMore]);

  // const filteredCasts = useMemo(() => {
  //   let filtered = filterFeedBasedOnFID(casts, filter.lowerFid, filter.upperFid);
  //   if (filter.showChannels.length > 0) {
  //     filtered = filterCastsBasedOnChannels(filtered, filter.showChannels);
  //   }
  //   if (filter.mutedChannels.length > 0) {
  //     filtered = filterCastsToMute(filtered, filter.mutedChannels);
  //   }
  //   if (filter.isPowerBadgeHolder) {
  //     filtered = filtered.filter((cast: { author: { power_badge: any; }; }) => cast.author?.power_badge);
  //   }
  //   return filtered;
  // }, [isFilterChanged, filter.lowerFid, filter.upperFid, filter.showChannels, filter.mutedChannels, filter.isPowerBadgeHolder]);

  // useEffect(() => {
  //   setFeed(filteredCasts);
  // }, [filteredCasts]);

  useEffect(() => {
    let filteredCasts = filterFeedBasedOnFID(casts, filter.lowerFid, filter.upperFid);
    if (filter.showChannels.length > 0) {
      filteredCasts = filterCastsBasedOnChannels(filteredCasts, filter.showChannels);
    }
    if (filter.mutedChannels.length > 0) {
      filteredCasts = filterCastsToMute(filteredCasts, filter.mutedChannels);
    }
    if (filter.isPowerBadgeHolder) {
      filteredCasts = filteredCasts.filter((cast: { author: { power_badge: any; }; }) => cast.author?.power_badge);
    }
    setFeed(filteredCasts);
  }, [isFilterChanged, filter])

  useEffect(() => {
    const handleFilterChange = () => {
      console.log('filter changed');
      setIsFilterChanged(prev => !prev)
    };

    eventEmitter.on('filterChanged', handleFilterChange);
    
    return () => {
      eventEmitter.off('filterChanged', handleFilterChange);
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={styles.flashList}
        data={feed}
        renderItem={({ item, index }) => <Cast key={index} cast={item} />}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        estimatedItemSize={100}
        ListFooterComponent={() =>
          isLoading && !isReachingEnd ? <ActivityIndicator size="large" color="#000000" /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  flashList: {
    backgroundColor: '#fff',
  },
});

export default React.memo(ChannelScreen);