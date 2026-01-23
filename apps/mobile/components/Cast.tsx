import React, { useState, useCallback, useMemo } from 'react'
import { View, StyleSheet, Text, Image, Platform, Pressable, TouchableOpacity, ScrollView } from 'react-native'
import { Link, router } from 'expo-router'
import type { NeynarCast, NeynarEmbed } from '@litecast/types'
import { usePrefetchThread } from '@litecast/hooks'
import { UserAvatar } from './UserAvatar'
import { ReactionBar } from './ReactionBar'
import { SystemColors } from '../constants/Colors'
import { EmbedRouter } from './embeds'
import QuoteCast from './QuoteCast'
import ImageViewer from './ImageViewer'

const Cast = ({ cast, truncate = false }: { cast: NeynarCast; truncate?: boolean }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const prefetchThread = usePrefetchThread();
  
  // Prefetch thread data when user presses on the cast
  // This eliminates loading states when navigating to cast detail
  const handleCastPress = useCallback(() => {
    prefetchThread(cast.hash);
    router.push(`/casts/${cast.hash}`);
  }, [cast.hash, prefetchThread]);
  
  const handleReaction = async (type: 'like' | 'recast', hash: string) => {
    // TODO: Implement reaction posting with new auth system
    console.log(`Reaction disabled: ${type} for ${hash}`)
  }

  // Helper to check if URL is an image
  const isImageUrl = (url: string, metadata?: { mime_type?: string; content_type?: string; image?: { height_px?: number; width_px?: number } }): boolean => {
    // Check content_type (Neynar API field) or mime_type first
    const mimeType = metadata?.content_type || metadata?.mime_type;
    if (mimeType && mimeType.startsWith('image/')) {
      return true;
    }
    
    // If metadata includes image dimensions, it's an image
    if (metadata?.image && (metadata.image.height_px || metadata.image.width_px)) {
      return true;
    }
    
    // Check file extension
    const extensionRegex = /\.(?:jpg|jpeg|png|gif|webp|avif|svg)(?:\?.*)?$/i;
    if (extensionRegex.test(url)) {
      return true;
    }
    
    // Check known image CDN hostnames (these serve images without extensions)
    const imageCdnHosts = [
      'imagedelivery.net',      // Cloudflare Images
      'i.imgur.com',            // Imgur
      'imgur.com',
      'i.ibb.co',               // imgbb
      'pbs.twimg.com',          // Twitter
      'media.giphy.com',        // Giphy
      'res.cloudinary.com',     // Cloudinary
      'images.unsplash.com',    // Unsplash
      'img.farcaster.xyz',      // Farcaster
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

  // Categorize embeds for rendering
  const { imageEmbeds, nonImageEmbeds } = useMemo(() => {
    if (!cast.embeds || cast.embeds.length === 0) {
      return { imageEmbeds: [], nonImageEmbeds: [] };
    }

    const images: Array<{ embed: NeynarEmbed; index: number }> = [];
    const others: Array<{ embed: NeynarEmbed; index: number }> = [];

    cast.embeds.slice(0, 4).forEach((embed, index) => {
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
  }, [cast.embeds]);

  const renderEmbeds = () => {
    if (!cast.embeds || cast.embeds.length === 0) {
      return null;
    }

    const renderedImages = imageEmbeds.map(({ embed, index }) => (
      <TouchableOpacity 
        key={`image-${embed.url}-${index}`}
        activeOpacity={0.9}
        onPress={() => setSelectedImage(embed.url!)}
      >
        <Image 
          source={{ uri: embed.url }} 
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ));

    const renderNonImageEmbed = ({ embed, index }: { embed: NeynarEmbed; index: number }) => {
      // Quote cast embed
      if (embed.cast) {
        return <QuoteCast key={`quote-${embed.cast.hash}-${index}`} cast={embed.cast} />;
      }
      // Use EmbedRouter for all other embeds (videos, frames, URLs, etc.)
      return <EmbedRouter key={`embed-${index}`} embed={embed} index={index} />;
    };

    // If more than 2 non-image embeds, use horizontal scroll
    const useHorizontalScroll = nonImageEmbeds.length > 2;

    return (
      <View style={styles.embedsWrapper}>
        {/* Render images vertically (they're usually full-width) */}
        {renderedImages}
        
        {/* Render non-image embeds */}
        {nonImageEmbeds.length > 0 && (
          useHorizontalScroll ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalEmbedScroll}
              style={styles.horizontalScrollContainer}
            >
              {nonImageEmbeds.map(({ embed, index }) => (
                <View key={`scroll-embed-${index}`} style={styles.horizontalEmbedItem}>
                  {renderNonImageEmbed({ embed, index })}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.verticalEmbeds}>
              {nonImageEmbeds.map(item => renderNonImageEmbed(item))}
            </View>
          )
        )}
      </View>
    );
  }

  // Format relative time nicely (e.g., "22m", "3h", "2d")
  const formatTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return `${Math.floor(diffDays / 7)}w`
  }

  const relativeTime = formatTime(cast.timestamp)
  
  // Truncate text to 200 characters if truncate is true
  const displayText = truncate && cast.text.length > 200 
    ? cast.text.substring(0, 200) + '...'
    : cast.text;
  const isTruncated = truncate && cast.text.length > 200;

  // Render text with linkified mentions
  const renderTextWithMentions = () => {
    if (!cast.mentioned_profiles_ranges || cast.mentioned_profiles_ranges.length === 0) {
      return <Text style={styles.castText}>{displayText}</Text>;
    }

    const text = displayText;
    const ranges = cast.mentioned_profiles_ranges;
    const mentionedProfiles = cast.mentioned_profiles || [];
    
    // Sort ranges by start position and match with profiles
    const sortedRanges = ranges.map((range, index) => ({
      ...range,
      index,
      profile: mentionedProfiles[index],
    })).sort((a, b) => a.start - b.start);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedRanges.forEach((range) => {
      // Add text before the mention
      if (range.start > lastIndex) {
        elements.push(text.substring(lastIndex, range.start));
      }

      // Add the mention as a link (using nested Text to stay inline)
      const mentionText = text.substring(range.start, range.end);
      const profile = range.profile;
      if (profile) {
        const username = profile.username;
        elements.push(
          <Text 
            key={`mention-${range.start}`} 
            style={styles.mention}
            onPress={() => router.push(`/${username}`)}
          >
            {mentionText}
          </Text>
        );
      } else {
        // Fallback if profile not found
        elements.push(mentionText);
      }

      lastIndex = range.end;
    });

    // Add remaining text after last mention
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return <Text style={styles.castText}>{elements}</Text>;
  };
  
  return (
    <>
      <View style={styles.glassContainer}>
        <View style={styles.castContainer}>
          <UserAvatar 
            fid={cast.author.fid} 
            pfpUrl={cast.author.pfp_url ?? ''} 
            username={cast.author.username}
            size={40}
          />
            <View style={styles.contentContainer}>
              <Pressable onPress={handleCastPress}>
                <View>
                  <Text style={styles.headerText} numberOfLines={1}>
                    <Text style={styles.displayName}>{cast.author.display_name}</Text>
                    {' '}
                    <Text style={styles.username}>@{cast.author.username}</Text>
                    <Text style={styles.separator}> · </Text>
                    <Text style={styles.timestamp}>{relativeTime}</Text>
                  </Text>
                  {renderTextWithMentions()}
                  {isTruncated && (
                    <Text style={styles.readMore}> Read more</Text>
                  )}
                </View>
              </Pressable>
              {renderEmbeds()}
              <ReactionBar 
                reactions={[
                  { icon: 'comment', count: cast.replies.count },
                  { icon: 'retweet', count: cast.reactions.recasts_count, active: cast.viewer_context?.recasted, onPress: () => handleReaction('recast', cast.hash) },
                  { icon: 'heart', count: cast.reactions.likes_count, active: cast.viewer_context?.liked, onPress: () => handleReaction('like', cast.hash) },
                ]}
              />
            </View>
        </View>
      </View>
      
      {/* Full-screen image viewer */}
      <ImageViewer
        visible={selectedImage !== null}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: SystemColors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  castContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: 'transparent',
  },
  castText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    color: SystemColors.label,
    fontSize: 15,
    lineHeight: 22,
    paddingRight: 8,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  mention: {
    color: SystemColors.label,
    fontWeight: '500',
  },
  readMore: {
    color: SystemColors.secondaryLabel,
    fontWeight: '500',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },
  headerText: {
    marginBottom: 4,
  },
  displayName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.2,
    color: SystemColors.label,
  },
  username: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontWeight: '400',
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  separator: {
    color: SystemColors.secondaryLabel,
    fontSize: 15,
  },
  flashList: {
    backgroundColor: '#fff',
  },
  icon: {
    resizeMode: 'contain',
  },
  timestamp: {
    fontWeight: '400',
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#f8f8f8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  // Embed layout styles
  embedsWrapper: {
    marginTop: 8,
  },
  verticalEmbeds: {
    gap: 8,
  },
  horizontalScrollContainer: {
    marginHorizontal: -16, // Extend to edges
    marginTop: 8,
  },
  horizontalEmbedScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  horizontalEmbedItem: {
    width: 280, // Fixed width for horizontal scroll items
  },
})

export default Cast
