import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Image, StyleSheet } from 'react-native';
import { Link } from 'solito/link';
import { Heart, Repeat2, MessageSquare  } from '@tamagui/lucide-icons';

import ComposeCast from '../../../components/ComposeCast';

export interface Cast {
  hash: string;
  author: {
    username: string;
    pfp_url: string;
    display_name: string;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: Array<{ fid: number, fname: string }>;
    recasts: Array<{ fid: number, fname: string }>;
  };
  replies: { count: number };
}

interface FeedResponse {
  casts: Cast[];
}

const CastComponent = ({ cast }: { cast: Cast }) => {
  const relativeTime = formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true });
  return (
    <View style={styles.castContainer}>
    <Image source={{ uri: cast.author.pfp_url }} style={styles.pfpImage} />
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

export default function Home() {
  const [feedResponse, setFeedResponse] = useState<FeedResponse | null>(null);

  useEffect(() => {
    async function getFeed() {
      const homeFeedUrl = 'https://api.neynar.com/v2/farcaster/feed?feed_type=following&fid=616&limit=25';
      //const trendingFeedUrl = 'https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=global_trending&limit=25';
      try {
        const response = await fetch(homeFeedUrl, {
          headers: {
            'Accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY ?? '',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setFeedResponse(result);
      } catch (error) {
        console.error('Error fetching feed:', error);
      }
    }

    getFeed();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {feedResponse?.casts.map((cast, index) => (
          <Link key={cast.hash} href={`/modal?hash=${cast.hash}`} asChild>
            <CastComponent cast={cast} />
          </Link>
        ))}
      </ScrollView>
      <ComposeCast />
    </View>
  );
}

const styles = StyleSheet.create({
  castContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
  },
  reactionsGroupContainer: {
    flexDirection: 'row',
    flexGap: 2,
    alignItems: 'center',
  },
  pfpImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 15,
    marginLeft: 10,
  },
  castTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  castText: {
    color: '#333', // Assuming dark text color from the image
    fontSize: 14,
    lineHeight: 18,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // reactionsContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'flex-start',
  //   paddingTop: 5,
  //   flex: 1,
  // },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  icon: {
    maxWidth: 16, // Set the maximum width of the icon
    resizeMode: 'contain', // Ensure the whole icon is visible and maintains aspect ratio
    flex: 1,
  },
  reactionTextFirst: {
    color: '#000',
    fontSize: 11,
  },
  reactionText: {
    color: '#000',
    marginLeft: 8,
    fontSize: 11,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    paddingRight: 6,
    paddingBottom: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    backgroundColor: '#ffffff',
    paddingBottom: 80, // Adjust this value to ensure enough space at the bottom
  },
});