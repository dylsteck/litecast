import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { LegendList } from '@legendapp/list';
import ComposeCast from '../../components/ComposeCast';
import { useCastWithReplies } from '../../hooks/queries/useCastWithReplies';
import { NeynarCast } from '../../lib/neynar/types';
import { PageHeader } from '../../components/PageHeader';
import Cast from '../../components/Cast';
import { SystemColors } from '../../constants/Colors';

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
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { cast, replies, isLoading, error } = useCastWithReplies(hash);

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

  if (!cast && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Cast not found</Text>
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
          {cast && (
            <>
              <Cast cast={cast} truncate={false} />
              {replies.length > 0 && (
                <>
                  <View style={styles.repliesHeader}>
                    <View style={styles.repliesDivider} />
                    <Text style={styles.repliesHeaderText}>
                      {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </Text>
                    <View style={styles.repliesDivider} />
                  </View>
                  <LegendList
                    data={replies}
                    renderItem={({ item }: { item: NeynarCast }) => (
                      <Cast cast={item} truncate={false} />
                    )}
                    keyExtractor={(item) => item.hash}
                    recycleItems
                  />
                </>
              )}
            </>
          )}
          {Platform.OS !== 'web' && cast && <ComposeCast hash={cast.hash} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SystemColors.background,
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
    backgroundColor: SystemColors.background,
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
    backgroundColor: SystemColors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: SystemColors.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: SystemColors.label,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: SystemColors.secondaryLabel,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  repliesDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
  },
  repliesHeaderText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '600',
    color: SystemColors.secondaryLabel,
    marginHorizontal: 12,
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
});

