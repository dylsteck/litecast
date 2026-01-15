import React, { useState } from 'react'
import { View, StyleSheet, Text, Image, Platform, Pressable, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import { NeynarCast, NeynarEmbed } from '../lib/neynar/types'
import { UserAvatar } from './UserAvatar'
import { ReactionBar } from './ReactionBar'
import { SystemColors } from '../constants/Colors'
import EmbedPreview from './EmbedPreview'
import FrameEmbed from './FrameEmbed'
import QuoteCast from './QuoteCast'
import ImageViewer from './ImageViewer'

const Cast = ({ cast, truncate = false }: { cast: NeynarCast; truncate?: boolean }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const renderEmbeds = () => {
    if (!cast.embeds || cast.embeds.length === 0) {
      return null;
    }

    // Limit to 3 embeds max for clean layout
    const embedsToRender = cast.embeds.slice(0, 3);

    return embedsToRender.map((embed: NeynarEmbed, index: number) => {
      // Quote cast embed
      if (embed.cast) {
        return <QuoteCast key={`quote-${embed.cast.hash}-${index}`} cast={embed.cast} />;
      }

      // Frame/miniapp embed
      if (embed.frame) {
        return <FrameEmbed key={`frame-${embed.frame.url}-${index}`} frame={embed.frame} />;
      }

      // Check if embed has metadata indicating it's an image (via content_type, mime_type, or image dimensions)
      const mimeType = embed.metadata?.content_type || embed.metadata?.mime_type;
      if (embed.url && (mimeType?.startsWith('image/') || embed.metadata?.image)) {
        return (
          <TouchableOpacity 
            key={`image-mime-${embed.url}-${index}`}
            activeOpacity={0.9}
            onPress={() => setSelectedImage(embed.url!)}
          >
            <Image 
              source={{ uri: embed.url }} 
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      }

      // URL embed with open_graph metadata (Neynar API format)
      if (embed.open_graph) {
        const metadata = {
          url: embed.open_graph.url || embed.url || '',
          title: embed.open_graph.title,
          description: embed.open_graph.description,
          image_url: embed.open_graph.image_url,
        };
        if (metadata.url) {
          return <EmbedPreview key={`embed-og-${metadata.url}-${index}`} metadata={metadata} />;
        }
      }

      // URL embed with metadata (alternative format) - but not if it's just an image
      if (embed.metadata && embed.metadata.url) {
        // If metadata has title/description, show as link preview
        if (embed.metadata.title || embed.metadata.description) {
          return <EmbedPreview key={`embed-meta-${embed.metadata.url}-${index}`} metadata={embed.metadata} />;
        }
      }

      // Plain URL embed - check if it's an image
      if (embed.url) {
        if (isImageUrl(embed.url, embed.metadata)) {
          return (
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
          );
        }
        
        // Non-image URL - create basic metadata object to show URL preview
        return (
          <EmbedPreview 
            key={`url-${embed.url}-${index}`}
            metadata={{ url: embed.url }}
          />
        );
      }

      return null;
    });
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
              <Link href={`/casts/${cast.hash}`} asChild>
                <Pressable>
                  <View>
                    <Text style={styles.headerText} numberOfLines={1}>
                      <Text style={styles.displayName}>{cast.author.display_name}</Text>
                      {' '}
                      <Text style={styles.username}>@{cast.author.username}</Text>
                      <Text style={styles.separator}> · </Text>
                      <Text style={styles.timestamp}>{relativeTime}</Text>
                    </Text>
                    <Text style={styles.castText}>
                      {displayText}
                      {isTruncated && (
                        <Text style={styles.readMore}> Read more</Text>
                      )}
                    </Text>
                  </View>
                </Pressable>
              </Link>
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
})

export default Cast
