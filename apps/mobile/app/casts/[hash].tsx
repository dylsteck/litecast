import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, Platform, StatusBar, useWindowDimensions, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ComposeCast from '../../components/ComposeCast';
import { useThread } from '@litecast/hooks';
import type { NeynarCast } from '@litecast/types';
import { PageHeader } from '../../components/PageHeader';
import Cast from '../../components/Cast';
import { UserAvatar } from '../../components/UserAvatar';
import { EmbedRouter } from '../../components/embeds';
import { SystemColors } from '../../constants/Colors';

// Format full date time for detail view
const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Format number with K/M suffix
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
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
  
  const { data, isLoading, error } = useThread(hash || '');
  
  // Extract cast and replies from thread response
  const cast = useMemo(() => data?.conversation?.cast, [data]);
  const replies = useMemo(() => data?.conversation?.direct_replies ?? [], [data]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={SystemColors.secondaryLabel} />
          <Text style={styles.errorText}>Failed to load thread</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SystemColors.secondaryLabel} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cast && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader />
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={SystemColors.secondaryLabel} />
          <Text style={styles.emptyText}>Cast not found</Text>
          <Text style={styles.emptySubtext}>This cast may have been deleted or doesn't exist.</Text>
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {cast && (
            <>
              {/* Main Cast - Prominent Display */}
              <View style={styles.mainCastContainer}>
                {/* Author Info */}
                <View style={styles.authorRow}>
                  <UserAvatar 
                    fid={cast.author.fid} 
                    pfpUrl={cast.author.pfp_url} 
                    username={cast.author.username}
                    size={48}
                  />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{cast.author.display_name}</Text>
                    <Text style={styles.authorUsername}>@{cast.author.username}</Text>
                  </View>
                </View>

                {/* Cast Text */}
                <Text style={styles.castText}>{cast.text}</Text>

                {/* Embeds */}
                {cast.embeds && cast.embeds.length > 0 && (
                  <View style={styles.embedsContainer}>
                    {cast.embeds.map((embed, index) => (
                      <EmbedRouter key={`embed-${index}`} embed={embed} index={index} />
                    ))}
                  </View>
                )}

                {/* Timestamp */}
                <Text style={styles.timestamp}>{formatDateTime(cast.timestamp)}</Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{formatCount(cast.replies.count)}</Text>
                    <Text style={styles.statLabel}> Replies</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{formatCount(cast.reactions.recasts_count)}</Text>
                    <Text style={styles.statLabel}> Recasts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{formatCount(cast.reactions.likes_count)}</Text>
                    <Text style={styles.statLabel}> Likes</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />
              </View>

              {/* Replies Section */}
              {replies.length > 0 ? (
                <View style={styles.repliesSection}>
                  <Text style={styles.repliesSectionTitle}>Replies</Text>
                  {replies.map((reply: NeynarCast) => (
                    <Cast key={reply.hash} cast={reply} truncate={false} />
                  ))}
                </View>
              ) : (
                <View style={styles.noRepliesContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color={SystemColors.tertiaryLabel} />
                  <Text style={styles.noRepliesText}>No replies yet</Text>
                  <Text style={styles.noRepliesSubtext}>Be the first to reply to this cast</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
        {Platform.OS !== 'web' && cast && <ComposeCast hash={cast.hash} />}
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
  scrollView: {
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
  scrollContent: {
    paddingBottom: 100, // Space for compose button
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
    padding: 32,
    backgroundColor: SystemColors.background,
    gap: 12,
  },
  errorText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  errorSubtext: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.2,
  },
  emptySubtext: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  // Main Cast Styles
  mainCastContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: SystemColors.background,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.2,
  },
  authorUsername: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    marginTop: 1,
    letterSpacing: -0.1,
  },
  castText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 17,
    color: SystemColors.label,
    lineHeight: 24,
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  embedsContainer: {
    marginBottom: 12,
  },
  timestamp: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SystemColors.separator,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.1,
  },
  statLabel: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  // Replies Section
  repliesSection: {
    backgroundColor: SystemColors.background,
  },
  repliesSectionTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: -0.2,
  },
  noRepliesContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  noRepliesText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    marginTop: 8,
    letterSpacing: -0.2,
  },
  noRepliesSubtext: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
});

