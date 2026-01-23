import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, StatusBar, useWindowDimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ComposeCast from '../../components/ComposeCast';
import { useThread } from '@litecast/hooks';
import type { NeynarCast, NeynarEmbed } from '@litecast/types';
import { PageHeader } from '../../components/PageHeader';
import Cast from '../../components/Cast';
import { UserAvatar } from '../../components/UserAvatar';
import { EmbedRouter, isQuoteCastEmbed } from '../../components/embeds';
import QuoteCast from '../../components/QuoteCast';
import ImageViewer from '../../components/ImageViewer';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { data, isLoading, error } = useThread(hash || '');
  
  // Extract cast and replies from thread response
  const cast = useMemo(() => data?.conversation?.cast, [data]);
  const replies = useMemo(() => {
    const directReplies = data?.conversation?.direct_replies;
    
    if (Array.isArray(directReplies)) {
      return directReplies;
    }
    
    // Fallback: check if replies are nested differently
    if (data?.conversation && 'replies' in data.conversation) {
      const repliesData = (data.conversation as any).replies;
      if (Array.isArray(repliesData)) {
        return repliesData;
      }
    }
    
    return [];
  }, [data]);

  // Helper to check if URL is an image (same logic as Cast.tsx)
  const isImageUrl = (url: string, metadata?: { mime_type?: string; content_type?: string; image?: { height_px?: number; width_px?: number } }): boolean => {
    const mimeType = metadata?.content_type || metadata?.mime_type;
    if (mimeType && mimeType.startsWith('image/')) {
      return true;
    }
    
    if (metadata?.image && (metadata.image.height_px || metadata.image.width_px)) {
      return true;
    }
    
    const extensionRegex = /\.(?:jpg|jpeg|png|gif|webp|avif|svg)(?:\?.*)?$/i;
    if (extensionRegex.test(url)) {
      return true;
    }
    
    const imageCdnHosts = [
      'imagedelivery.net',
      'i.imgur.com',
      'imgur.com',
      'i.ibb.co',
      'pbs.twimg.com',
      'media.giphy.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'img.farcaster.xyz',
    ];
    
    try {
      const urlObj = new URL(url);
      if (imageCdnHosts.some(host => urlObj.hostname.includes(host))) {
        return true;
      }
    } catch {
      // Invalid URL
    }
    
    return false;
  };

  // Categorize embeds for rendering (same logic as Cast.tsx)
  const { imageEmbeds, nonImageEmbeds } = useMemo(() => {
    if (!cast?.embeds || cast.embeds.length === 0) {
      return { imageEmbeds: [], nonImageEmbeds: [] };
    }

    const images: Array<{ embed: NeynarEmbed; index: number }> = [];
    const others: Array<{ embed: NeynarEmbed; index: number }> = [];

    cast.embeds.forEach((embed, index) => {
      // Skip Farcaster token links
      if (embed.url && /farcaster\.xyz\/~\/ca\//i.test(embed.url)) {
        return;
      }

      const mimeType = embed.metadata?.content_type || embed.metadata?.mime_type;
      
      // Check if it's an image
      if (embed.url && (mimeType?.startsWith('image/') || embed.metadata?.image || isImageUrl(embed.url, embed.metadata))) {
        images.push({ embed, index });
      } else {
        others.push({ embed, index });
      }
    });

    return { imageEmbeds: images, nonImageEmbeds: others };
  }, [cast?.embeds]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <PageHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SystemColors.secondaryLabel} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cast && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                    {/* Render image embeds */}
                    {imageEmbeds.map(({ embed, index }) => (
                      <TouchableOpacity 
                        key={`image-${embed.url}-${index}`}
                        activeOpacity={0.9}
                        onPress={() => setSelectedImage(embed.url!)}
                      >
                        <Image 
                          source={{ uri: embed.url }} 
                          style={styles.imageEmbed}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                    
                    {/* Render non-image embeds */}
                    {nonImageEmbeds.map(({ embed, index }) => {
                      // Handle quote casts separately
                      if (isQuoteCastEmbed(embed) && embed.cast) {
                        return <QuoteCast key={`quote-${embed.cast.hash}-${index}`} cast={embed.cast} />;
                      }
                      return <EmbedRouter key={`embed-${index}`} embed={embed} index={index} />;
                    })}
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
                  <Text style={styles.repliesSectionTitle}>
                    {replies.length === 1 ? '1 Reply' : `${replies.length} Replies`}
                  </Text>
                  {replies.map((reply: NeynarCast) => (
                    <Cast key={reply.hash} cast={reply} truncate={false} />
                  ))}
                </View>
              ) : cast.replies.count > 0 ? (
                // If count says there are replies but array is empty, show loading
                <View style={styles.noRepliesContainer}>
                  <ActivityIndicator size="small" color={SystemColors.secondaryLabel} />
                  <Text style={styles.noRepliesText}>Loading replies...</Text>
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
    gap: 8,
  },
  imageEmbed: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: SystemColors.secondaryBackground,
    marginBottom: 8,
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

