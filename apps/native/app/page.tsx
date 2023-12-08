import { FlashList } from '@shopify/flash-list';
import { Heart, Repeat2, MessageSquare } from '@tamagui/lucide-icons';
import { formatDistanceToNow } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { Link } from 'solito/link';

import ComposeCast from '../components/ComposeCast';
import useLatestCasts from '../hooks/useLatestCasts';
import { Cast } from '../providers/NeynarProvider';

const CastComponent = ({ cast }: { cast: Cast }) => {
  const relativeTime = formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true });
  return (
    <View style={styles.castContainer}>
      <Image source={{ uri: cast.author.pfp_url }} style={styles.pfpImage} alt="Profile" />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.displayName}>{cast.author.display_name}</Text>
          <Text style={styles.timestamp}>{_.replace(relativeTime, 'about ', '')}</Text>
        </View>
        <Text style={styles.castText}>{cast.text}</Text>
        <View style={styles.reactionsContainer}>
          <View style={styles.reactionsGroupContainer}>
            <Heart style={styles.icon} />
            <Text style={styles.reactionTextFirst}> {cast.reactions.likes.length}</Text>
          </View>
          <View style={styles.reactionsGroupContainer}>
            <Repeat2 style={styles.icon} />
            <Text style={styles.reactionText}> {cast.reactions.recasts.length}</Text>
          </View>
          <View style={styles.reactionsGroupContainer}>
            <MessageSquare style={styles.icon} />
            <Text style={styles.reactionText}> {cast.replies.count}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function Page() {
  const { pageId, sharedTransitionTag } = useLocalSearchParams<never>();
  const { casts, isLoading, loadMore, isReachingEnd } = useLatestCasts('trending', pageId && String(pageId).length > 0 && pageId !== 'trending' ? pageId : '');

  const onEndReached = useCallback(() => {
    if (!isReachingEnd) {
      loadMore();
    }
  }, [isReachingEnd, loadMore]);

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={styles.flashList}
        data={casts}
        renderItem={({ item }) =>  <Link key={item.hash} href={`/modal?hash=${item.hash}`} asChild><CastComponent cast={item} /></Link>}
        keyExtractor={(item) => item.hash}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => isLoading && !isReachingEnd ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      />
      <ComposeCast />
    </View>
  );
}

const styles = StyleSheet.create({
  castContainer: {
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
    flexDirection: 'row',
    padding: 10,
  },
  castText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 18,
  },
  castTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  flashList: {
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    flex: 1,
    maxWidth: 16,
    resizeMode: 'contain',
  },
  pfpImage: {
    borderRadius: 25,
    height: 30,
    marginLeft: 10,
    marginRight: 15,
    width: 30,
  },
  reactionText: {
    color: '#000',
    fontSize: 11,
  },
  reactionTextFirst: {
    color: '#000',
    fontSize: 11,
  },
  reactionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  reactionsGroupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 4,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    paddingBottom: 4,
    paddingRight: 6,
  },
});
