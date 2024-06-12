import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import { FontAwesome } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useLogin } from 'farcasterkit-react-native'

export type NeynarCastV1 = {
  hash: string
  parentHash: string | null
  parentUrl: string | null
  threadHash: string
  parentAuthor: {
    fid: number | null
  }
  author: {
    fid: number
    custodyAddress: string
    username: string
    displayName: string
    pfp: {
      url: string
    }
    profile: {
      bio: {
        text: string
        mentionedProfiles: any[]
      }
    }
    followerCount: number
    followingCount: number
    verifications: string[]
    activeStatus: 'active' | 'inactive'
  }
  text: string
  timestamp: string
  embeds: { url: string }[]
  mentionedProfiles: {
    fid: number
    custodyAddress: string
    username: string
    displayName: string
    pfp: {
      url: string
    }
    profile: {
      bio: {
        text: string
        mentionedProfiles: any[]
      }
    }
    followerCount: number
    followingCount: number
    verifications: string[]
    activeStatus: 'active' | 'inactive'
  }[]
  reactions: {
    count: number
    fids: number[]
    fnames: string[]
  }
  recasts: {
    count: number
    fids: number[]
  }
  recasters: string[]
  viewerContext: {
    liked: boolean
    recasted: boolean
  }
  replies: {
    count: number
  }
  children: any
}

export default function ConversationScreen() {
  const route = useRoute<any>()
  const hash = route.params?.hash as string
  const { farcasterUser } = useLogin()
  const [parentHash, setParentHash] = useState<string | null>(null) // todo: rename, this is just for fetchThread
  const [navigationParentHash, setNavigationParentHash] = useState<
    string | null
  >(hash)
  const [thread, setThread] = useState<NeynarCastV1[]>([])
  const navigation = useNavigation<any>()
  const neynarApiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY

  const handleBackPress = () => {
    // if(navigationParentHash === null || navigationParentHash === hash){
    //   console.log("back to index, here's last value ", navigationParentHash);
    //   navigation.navigate('index');
    // }
    // else{
    //   navigation.setParams({ hash: navigationParentHash })
    navigation.navigate('index')
    setNavigationParentHash(null)
  }

  const handleCastPress = (childHash: string) => {
    navigation.setParams({ hash: childHash })
    setNavigationParentHash(childHash)
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={{ paddingLeft: 15, fontWeight: '300' }}>Back</Text>
        </TouchableOpacity>
      ),
      title: 'Thread',
      headerTitleStyle: {
        color: 'black',
      },
    })
  }, [hash, navigation])

  useEffect(() => {
    // TOOD: move to farcasterkit-react-native
    async function fetchThread() {
      if (thread.some((cast) => cast.hash === hash)) {
        const itemIndex = thread.findIndex((cast) => cast.hash === hash)
        if (itemIndex > 0) {
          const newThread = thread.slice(itemIndex)
          if (newThread[0].hash !== parentHash) {
            setParentHash(newThread[0].parentHash)
          } else {
            setParentHash(null)
          }
          setThread(newThread)
        }
      } else {
        const url = `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${hash}&viewerFid=${farcasterUser?.fid}`
        try {
          const response = await fetch(url, {
            headers: {
              Accept: 'application/json',
              api_key: neynarApiKey as string,
            },
            method: 'GET',
          })
          const data = await response.json()
          const newThread = organizeThread(data.result.casts)
          setThread(newThread)
          if (newThread[0].hash !== parentHash) {
            setParentHash(newThread[0].parentHash)
          } else {
            setParentHash(null)
          }
        } catch (error) {
          console.error('Error fetching thread:', error)
        }
      }
    }
    if (hash) {
      fetchThread()
    }
  }, [hash])

  const organizeThread = (data: NeynarCastV1[]): NeynarCastV1[] => {
    let thread: NeynarCastV1[] = []
    let map: { [key: string]: NeynarCastV1 } = {}
    data.forEach((cast) => {
      map[cast.hash] = cast
      cast.children = []
      thread.push(cast)
    })
    return thread
  }

  const renderCast = ({ item: cast, index }: { item: NeynarCastV1, index: number }) => {
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
        <Image key={url} source={{ uri: url }} style={styles.image} />
      ))
    }

    return (
      <TouchableOpacity key={index} onPress={() => handleCastPress(cast.hash)}>
        <View style={styles.castContainer}>
          <Image
            source={{ uri: cast.author.pfp.url }}
            style={styles.pfpImage}
          />
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.displayName}>{cast.author.displayName}</Text>
              <Text style={styles.timestamp}>
                {_.replace(
                  formatDistanceToNow(new Date(cast.timestamp)),
                  'about ',
                  '',
                )}{' '}
                ago
              </Text>
            </View>
            <Text style={styles.castText}>{cast.text}</Text>
            {renderImages()}
          </View>
          {/* <TouchableOpacity>
            <Link
              href={`https://warpcast.com/${cast.author.username}/${cast.hash}`}
            >
              <FontAwesome name="external-link" size={11} color="black" />
            </Link>
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={styles.scrollView}
        data={thread}
        estimatedItemSize={100}
        renderItem={renderCast}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
  castContainer: {
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  displayName: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#999',
  },
  castText: {
    color: '#000000',
  },
  pfpImage: {
    borderRadius: 25,
    height: 25,
    width: 25,
    marginRight: 2,
    marginTop: 9,
  },
  image: {
    width: 100, // Set your desired image width
    height: 100, // Set your desired image height
    marginRight: 4,
    paddingBottom: 4,
  },
})
