import _ from 'lodash'
import { formatDistanceToNow } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useLogin, useReaction } from 'farcasterkit-react-native'
import { Link } from 'expo-router'

const Cast = ({ cast }: { cast: NeynarCastV2 }) => {
  const { farcasterUser } = useLogin()
  const postReaction = useReaction()
  const [reactions, setReactions] = useState<Reactions>({
    likes: [],
    recasts: [],
  }) // track reactions in state to optimistically update when the user reacts

  useEffect(() => {
    setReactions(cast?.reactions)
  }, [cast])

  const handleReaction = async (type: 'like' | 'recast', hash: string) => {
    try {
      if (!farcasterUser) throw new Error('Not logged in')
      await postReaction(type, hash)
      // TODO: handle unlikes and un-recasts
      if (type === 'like') {
        setReactions({
          ...reactions,
          likes: [...reactions.likes, farcasterUser],
        })
      } else if (type === 'recast') {
        setReactions({
          ...reactions,
          recasts: [...reactions.recasts, farcasterUser],
        })
      }
    } catch (error) {
      console.error('Error posting reaction:', error)
    }
  }

  const renderImages = () => {
    // Regex to match image URLs
    const regex = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/g

    // Find matches in cast.text
    const textMatches = cast?.text?.match(regex) || []

    // Extract URLs from cast.embeds
    const embedMatches = cast?.embeds
      .filter((embed) => embed.url && embed.url.match(regex))
      .map((embed) => embed.url)

    // Combine and de-duplicate URLs from text and embeds
    if(textMatches?.length > 0 || embedMatches?.length > 0) {
      const allMatches = Array.from(new Set([...textMatches, ...embedMatches]))
      if(allMatches?.length > 0) {
        return allMatches.map((url) => (
          <Image key={url} source={{ uri: url }} style={styles.image} />
        ))
      } else {
        return []
      }
    } else {
      return []
    }

    // Render images
  }

  const relativeTime = formatDistanceToNow(
    new Date(cast?.timestamp ?? Date.now()),
    {
      addSuffix: true,
    },
  )
  return (
    // <Link href={`/conversation?hash=${cast.hash}`}>
    <TouchableOpacity>
      <Link href={`https://warpcast.com/${cast?.author?.username}/${cast?.hash}`}>
        <View style={styles.castContainer}>
          <Image
            source={{ uri: cast?.author?.pfp_url ?? '' }}
            style={styles.pfpImage}
          />
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.displayName}>
                {cast?.author?.display_name} ·{' '}
                <Text style={styles.timestamp}>
                  {_.replace(relativeTime, 'about ', '')}
                </Text>
              </Text>
              {/* <Text style={styles.timestamp}>{_.replace(relativeTime, 'about ', '')}</Text> */}
            </View>
            <Text style={styles.castText}>{cast?.text}</Text>
            {renderImages()}
            <View style={styles.reactionsContainer}>
              <View style={styles.reactionsGroupContainer}>
                <FontAwesome name="comment-o" size={11} color="black" />
                <Text style={styles.reactionText}> {cast?.replies.count}</Text>
              </View>
              <TouchableOpacity
                disabled={!farcasterUser}
                onPress={() => handleReaction('recast', cast?.hash)}
              >
                <View style={styles.reactionsGroupContainer}>
                  <FontAwesome
                    name="retweet"
                    size={11}
                    color={
                      reactions?.recasts?.some(
                        (r) => r.fid === farcasterUser?.fid,
                      )
                        ? 'green'
                        : 'black'
                    }
                    style={{ opacity: farcasterUser ? 100 : 50 }}
                  />
                  <Text style={styles.reactionText}>
                    {' '}
                    {reactions?.recasts?.length}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!farcasterUser}
                onPress={() => handleReaction('like', cast?.hash)}
              >
                <View style={styles.reactionsGroupContainer}>
                  <FontAwesome
                    name={
                      reactions?.likes?.some((r) => r.fid === farcasterUser?.fid)
                        ? 'heart'
                        : 'heart-o'
                    }
                    size={11}
                    color={
                      reactions?.likes?.some((r) => r.fid === farcasterUser?.fid)
                        ? 'red'
                        : 'black'
                    }
                    style={{ opacity: farcasterUser ? 100 : 50 }}
                  />
                  <Text style={styles.reactionTextFirst}>
                    {' '}
                    {reactions?.likes?.length}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* View on Warpcast */}
              {/* <TouchableOpacity>
              <Link href={`https://warpcast.com/${cast.author.username}/${cast.hash}`}>
                <FontAwesome name="external-link" size={11} color="black" />
              </Link>
            </TouchableOpacity> */}
            </View>
          </View>
        </View>
        {/* </Link> */}
      </Link>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  castContainer: {
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
    flexDirection: 'row',
    padding: 10,
    zIndex: -50,
    width: '100%',
  },
  castText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 18,
    paddingRight: 8,
    paddingBottom: 3,
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
    gap: 24,
    marginTop: 4,
    paddingBottom: 1,
  },
  reactionsGroupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 4,
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
    width: 100, // Set your desired image width
    height: 100, // Set your desired image height
    marginRight: 4,
    paddingBottom: 4,
  },
})

export default Cast
