import React, { useMemo, useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation, Link } from 'expo-router';
import { LegendList } from '@legendapp/list';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { FontAwesome } from '@expo/vector-icons';
import ComposeCast from '../../components/ComposeCast';
import { useCastWithReplies } from '../../hooks/queries/useCastWithReplies';
import { NeynarCast } from '../../lib/neynar/types';
import { PageHeader } from '../../components/PageHeader';

export type NeynarCastV1 = {
  hash: string;
  parentHash: string | null;
  parentUrl: string | null;
  threadHash: string;
  parentAuthor: {
    fid: number | null;
  };
  author: {
    fid: number;
    custodyAddress: string;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
    profile: {
      bio: {
        text: string;
        mentionedProfiles: any[];
      };
    };
    followerCount: number;
    followingCount: number;
    verifications: string[];
    activeStatus: 'active' | 'inactive';
  };
  text: string;
  timestamp: string;
  embeds: { url: string }[];
  mentionedProfiles: {
    fid: number;
    custodyAddress: string;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
    profile: {
      bio: {
        text: string;
        mentionedProfiles: any[];
      };
    };
    followerCount: number;
    followingCount: number;
    verifications: string[];
    activeStatus: 'active' | 'inactive';
  }[];
  reactions: {
    count: number;
    fids: number[];
    fnames: string[];
  };
  recasts: {
    count: number;
    fids: number[];
  };
  recasters: string[];
  viewerContext: {
    liked: boolean;
    recasted: boolean;
  };
  replies: {
    count: number;
  };
};

export default function CastScreen() {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  const { hash } = useLocalSearchParams<{ hash: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { cast, replies, isLoading, error } = useCastWithReplies(hash);
  
  const thread = useMemo(() => {
    if (!cast) return [];
    console.log('📊 Thread assembled:', { 
      mainCast: 1,
      replies: replies.length,
      total: 1 + replies.length,
    });
    return [cast, ...replies];
  }, [cast, replies]);

  const handleCastPress = (childHash: string) => {
    router.push(`/casts/${childHash}`);
  };

  const isMainCast = (index: number) => index === 0;

  const renderCast = ({ item: cast, index }: { item: NeynarCast; index: number }) => {
    const renderImages = () => {
      const regex = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/g;
      const textMatches = cast.text.match(regex) || [];
      const embedMatches = cast.embeds
        .filter(embed => embed.url && embed.url.match(regex))
        .map(embed => embed.url);
      const allMatches = Array.from(new Set([...textMatches, ...embedMatches]));
      
      return allMatches.map((url) => (
        <Image key={url} source={{ uri: url }} style={isMainCast(index) ? styles.mainImage : styles.image} />
      ));
    };
    
    const relativeTime = _.replace(formatDistanceToNow(new Date(cast.timestamp)), 'about ', '');
    
    return(
      <View style={[styles.castContainer, isMainCast(index) && styles.mainCastContainer]}>
        <Link href={cast.author.username ? `/${cast.author.username}` : `/fids/${cast.author.fid}`} asChild>
          <TouchableOpacity>
            <Image source={{ uri: cast.author.pfp_url }} style={styles.pfpImage} />
          </TouchableOpacity>
        </Link>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.displayName}>{cast.author.display_name}</Text>
            <Text style={styles.username}>@{cast.author.username}</Text>
          </View>
          <Text style={[styles.castText, isMainCast(index) && styles.mainCastText]}>{cast.text}</Text>
          {renderImages()}
          <Text style={styles.timestamp}>{relativeTime} ago</Text>
          
          {isMainCast(index) && (
            <View style={styles.reactionsContainer}>
              <View style={styles.reactionItem}>
                <FontAwesome name="comment-o" size={14} color="#666" />
                <Text style={styles.reactionText}>{cast.replies.count}</Text>
              </View>
              <View style={styles.reactionItem}>
                <FontAwesome name="retweet" size={14} color="#666" />
                <Text style={styles.reactionText}>{cast.reactions.recasts_count}</Text>
              </View>
              <View style={styles.reactionItem}>
                <FontAwesome name="heart-o" size={14} color="#666" />
                <Text style={styles.reactionText}>{cast.reactions.likes_count}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load thread</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  if (thread.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversation found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {showGuardrails && (
          <>
            <View style={styles.guardrailLeft} />
            <View style={styles.guardrailRight} />
          </>
        )}
        <PageHeader />
        <View style={styles.container}>
          <LegendList
            data={thread}
            renderItem={renderCast}
            keyExtractor={(item, index) => `${item.hash}-${index}`}
            recycleItems
          />
          {Platform.OS !== 'web' && <ComposeCast hash={thread[0].hash} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  guardrailLeft: Platform.select({
    web: {
      position: 'absolute' as const,
      left: 'calc(50% - 300px)' as any,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      zIndex: 1,
    },
    default: {},
  }),
  guardrailRight: Platform.select({
    web: {
      position: 'absolute' as const,
      right: 'calc(50% - 300px)' as any,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      zIndex: 1,
    },
    default: {},
  }),
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  castContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  mainCastContainer: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentContainer: {
    flex: 1,
    gap: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    color: '#999',
    fontSize: 13,
    marginTop: 4,
  },
  castText: {
    color: '#000',
    fontSize: 16,
    lineHeight: 22,
  },
  mainCastText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  pfpImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  mainImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

