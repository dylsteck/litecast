/* eslint-disable lodash/prefer-lodash-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRoute, useNavigation } from '@react-navigation/native';
import { Heart, Repeat2, MessageSquare  } from '@tamagui/lucide-icons';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'solito/link';

import ComposeCast from '../components/ComposeCast';
import ThreadedUI from '../components/ThreadedUI';

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

export default function ModalScreen() {
  const [parentHash, setParentHash] = useState<string | null>(null);
  const [thread, setThread] = useState([]);
  const route = useRoute();
  const hash = route.params?.hash as unknown as string;
  const navigation = useNavigation();

  const handlePress = () => {
    if(parentHash !== null){
      navigation.navigate('modal', { hash: parentHash })
    }
    else{
      navigation.navigate('home', {key: ''})
    }
  };

  useEffect(() => {
    console.log(navigation.getState().routes);
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handlePress}>
          <Text>Back</Text>
        </TouchableOpacity>
      ),
      title: 'Thread'
    });
  }, [hash, navigation]);

  useEffect(() => {
    async function fetchThread() {
      if (thread.some(cast => cast.hash === hash)) {
        const itemIndex = thread.findIndex(cast => cast.hash === hash);
        if(itemIndex > 0){
          const newThread = thread.slice(itemIndex);
          if(newThread[0].hash !== parentHash){
            setParentHash(newThread[0].parentHash)
          }
          else{
            setParentHash(null)
          } 
          setThread(newThread);
        }

      }
      else{
        const url = `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${hash}&viewerFid=3`;
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'api_key': process.env.NEYNAR_API_KEY ?? '',
            },
            method: 'GET',
          });
          const data = await response.json();
          const newThread = organizeThread(data.result.casts);
          setThread(data.result.casts);
          if(newThread[0].hash !== parentHash){
            setParentHash(newThread[0].parentHash)
          }
          else{
            setParentHash(null)
          } 
        } catch (error) {
          console.error('Error fetching thread:', error);
        }
      }
    }
    if (hash) {
      fetchThread();
    }
  }, [hash]);

  // TODO: add types here
  const organizeThread = (data) => {
    let thread = [];
    let map = {};
    data.forEach((cast) => {
      map[cast.hash] = cast;
      cast.children = [];
      if (cast.parentHash && map[cast.parentHash]) {
        map[cast.parentHash].children.push(cast);
      } else {
        thread.push(cast);
      }
    });
    return thread;
  };

  const renderThread = (casts, level = 0) => {
    return casts.map((cast) => (
      <View key={cast.hash}>
        <MainCast cast={cast} />
      </View>
    ));
  };

  const MainCast = ({ cast }: { cast: NeynarCastV1 }) => {
    const relativeTime = formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true });
    return (
      <Link key={cast.hash} href={`/modal?hash=${cast.hash}`} asChild={true}>
        <View style={styles.castContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.nameContainer}>
              <Image source={{ uri: cast.author.pfp.url }} style={styles.pfpImage} />
              <Text style={styles.displayName}>{cast.author.displayName}</Text>
            </View>
            <Text style={styles.timestamp}>{_.replace(relativeTime, 'about ', '')}</Text>
          </View>
          <Text style={styles.castText}>{cast.text}</Text>
          <View style={styles.reactionsContainer}>
          <View style={styles.reactionsGroupContainer}>
              <Heart style={styles.icon} />
              <Text style={styles.reactionTextFirst}> {cast.reactions.count}</Text>
            </View>
            <View style={styles.reactionsGroupContainer}>
              <Repeat2 style={styles.icon} />
              <Text style={styles.reactionText}> {cast.recasts.count}</Text>
            </View>
            <View style={styles.reactionsGroupContainer}>
              <MessageSquare style={styles.icon} />
              <Text style={styles.reactionText}> {cast.replies.count}</Text>
            </View>
        </View>
        </View>
      </View>
    </Link>
    );
  }

  const TopMainCast = ({ cast }: { cast: NeynarCastV1 }) => {
      const relativeTime = formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true });
      return (
        <Link key={cast.hash} href={`/modal?hash=${cast.hash}`} asChild={true}>
          <View style={styles.castContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.nameContainer}>
                <Image source={{ uri: cast.author.pfp.url }} style={styles.pfpImage} />
                <View style={styles.nameTextContainer}>
                  <Text style={styles.displayName}>{cast.author.displayName}</Text>
                  <Text style={styles.timestamp}>@{cast.author.username}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.castText}>{cast.text}</Text>
            <Text style={styles.timestamp}>{_.replace(relativeTime, 'about ', '')}</Text>
            <View style={styles.reactionsContainer}>
            <View style={styles.reactionsGroupContainer}>
                <Heart style={styles.icon} />
                <Text style={styles.reactionTextFirst}> {cast.reactions.count} Likes</Text>
              </View>
              <View style={styles.reactionsGroupContainer}>
                <Repeat2 style={styles.icon} />
                <Text style={styles.reactionText}> {cast.recasts.count} Recasts</Text>
              </View>
              <View style={styles.reactionsGroupContainer}>
                <MessageSquare style={styles.icon} />
                <Text style={styles.reactionText}> {cast.replies.count} Replies</Text>
              </View>
          </View>
          </View>
        </View>
      </Link>
      );
    }

  return (
    <>
      <ScrollView style={styles.scrollView}>
        {thread && thread.length > 0 &&
        <>
          <TopMainCast cast={thread[0]} />
          {/* {renderThread(thread.slice(1))} */}
          <ThreadedUI items={thread.slice(1)} />
        </>
        }
      </ScrollView>
      <ComposeCast hash={hash as string} />
    </>
  );
}

const styles = StyleSheet.create({
  // castContainer: {
  //   borderBottomWidth: 1,
  //   borderColor: '#eaeaea',
  //   flexDirection: 'row',
  //   padding: 0,
  // },
  castContainer: {
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
    flex: 1,
    marginRight: 10,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 5,
  },
  castDetails: {
    flex: 1,
  },
  castText: {
    color: '#000',
    letterSpacing: 0.2,
    marginTop: 25,
    opacity: 0.8, 
  },
  castTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: '500',
    marginBottom: 1,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    flex: 1,  
    maxWidth: 16, 
    resizeMode: 'contain',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 1,
  },
  nameTextContainer: {
    flexDirection: 'column',
    flexGap: 1,
    marginTop: 10
  },
  pfpImage: {
    borderRadius: 25,
    height: 45,
    marginRight: 15,
    width: 45,
  },
  profilePic: {
    borderRadius: 25,
    height: 50,
    marginRight: 10,
    width: 50,
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
    gap: 24,
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  reactionsGroupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
  threadLineContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 0,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    paddingTop: 10, 
  },
  username: {
    color: '#000',
    fontSize: 13,
    opacity: 0.8
  },
  verticalLine: {
    backgroundColor: '#e1e1e1',
    width: 2,
  },
});