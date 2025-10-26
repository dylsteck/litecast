import _ from 'lodash'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native'
import { Link } from 'expo-router'
import { BlurView } from 'expo-blur'
import { NeynarCast } from '../lib/neynar/types'
import { UserAvatar } from './UserAvatar'
import { ReactionBar } from './ReactionBar'

const Cast = ({ cast }: { cast: NeynarCast }) => {
  const handleReaction = async (type: 'like' | 'recast', hash: string) => {
    // TODO: Implement reaction posting with new auth system
    console.log(`Reaction disabled: ${type} for ${hash}`)
  }

  const renderImages = () => {
    // Regex to match image URLs
    const regex = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/g

    // Find matches in cast.text
    const textMatches = cast.text.match(regex) || []

    // Extract URLs from cast.embeds
    const embedMatches = cast.embeds
      .filter((embed) => embed.url && embed.url.match(regex))
      .map((embed) => embed.url)

    // Combine and de-duplicate URLs from text and embeds
    const allMatches = Array.from(new Set([...textMatches, ...embedMatches]))

    // Render images
    return allMatches.map((url) => (
      <Image 
        key={url} 
        source={{ uri: url }} 
        style={styles.image}
        resizeMode="cover"
      />
    ))
  }

  const relativeTime = formatDistanceToNow(new Date(cast.timestamp), {
    addSuffix: true,
  })
  return (
    <BlurView
      intensity={0}
      tint="default"
      style={styles.glassContainer}
    >
      <View style={styles.castContainer}>
        <UserAvatar 
          fid={cast.author.fid} 
          pfpUrl={cast.author.pfp_url ?? ''} 
          size={30}
        />
        <Link href={`/conversation?hash=${cast.hash}`} style={{ flex: 1 }}>
          <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.displayName}>
              {cast.author.display_name} ·{' '}
              <Text style={styles.timestamp}>
                {_.replace(relativeTime, 'about ', '')}
              </Text>
            </Text>
            {/* <Text style={styles.timestamp}>{_.replace(relativeTime, 'about ', '')}</Text> */}
          </View>
          <Text style={styles.castText} numberOfLines={6}>
            {cast.text}
          </Text>
          {renderImages()}
          <ReactionBar 
            reactions={[
              { icon: 'comment', count: cast.replies.count },
              { icon: 'retweet', count: cast.reactions.recasts_count, onPress: () => handleReaction('recast', cast.hash) },
              { icon: 'heart', count: cast.reactions.likes_count, onPress: () => handleReaction('like', cast.hash) },
            ]}
          />
          </View>
        </Link>
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  castContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: 'transparent',
  },
  castText: {
    color: '#000',
    fontSize: 16,
    lineHeight: 22,
    paddingRight: 8,
    paddingBottom: 4,
    fontWeight: '400',
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
    resizeMode: 'contain',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    fontWeight: '300',
    paddingBottom: 4,
    paddingRight: 6,
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
})

export default Cast
