import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';

import ComposeCast from '../../components/ComposeCast';
import { Link } from 'expo-router';
import { useLogin } from '../../providers/NeynarProvider';

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

export default function ConversationScreen() {
  const { farcasterUser } = useLogin();
  const [parentHash, setParentHash] = useState<string | null>(null);
  const [thread, setThread] = useState<NeynarCastV1[]>([]);
  const route = useRoute();
  const hash = route.params?.hash as string;
  const navigation = useNavigation();

  const handlePress = () => {
    if (parentHash !== null) {
      navigation.navigate('conversation', { hash: parentHash });
    } else {
      navigation.navigate('index', { key: '' });
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handlePress}>
          <Text style={{paddingLeft: 15, fontWeight: '300'}}>Back</Text>
        </TouchableOpacity>
      ),
      title: 'Thread'
    });
  }, [hash, navigation]);

  useEffect(() => {
    async function fetchThread() {
      if (thread.some(cast => cast.hash === hash)) {
        const itemIndex = thread.findIndex(cast => cast.hash === hash);
        if (itemIndex > 0) {
          const newThread = thread.slice(itemIndex);
          if (newThread[0].hash !== parentHash) {
            setParentHash(newThread[0].parentHash);
          } else {
            setParentHash(null);
          }
          setThread(newThread);
        }
      } else {
        const url = `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${hash}&viewerFid=${farcasterUser?.fid}`;
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'api_key': "",
            },
            method: 'GET',
          });
          const data = await response.json();
          const newThread = organizeThread(data.result.casts);
          setThread(newThread);
          if (newThread[0].hash !== parentHash) {
            setParentHash(newThread[0].parentHash);
          } else {
            setParentHash(null);
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

  const organizeThread = (data: NeynarCastV1[]): NeynarCastV1[] => {
    let thread: NeynarCastV1[] = [];
    let map: { [key: string]: NeynarCastV1 } = {};
    data.forEach((cast) => {
      map[cast.hash] = cast;
      cast.children = [];
      // if (cast.parentHash && map[cast.parentHash]) {
      //   map[cast.parentHash].children.push(cast);
      // } else {
      //   thread.push(cast);
      // }
      thread.push(cast);
    });
    return thread;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {thread && thread.length > 0 && (
          <>
            {thread.map((cast, index) => (
              <Link key={index} href={`/conversation?hash=${cast.hash}`} asChild>
                <View style={styles.castContainer}>
                  <Image source={{ uri: cast.author.pfp.url }} style={styles.pfpImage} />
                  <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                      <Text style={styles.displayName}>{cast.author.displayName}</Text>
                      <Text style={styles.timestamp}>{_.replace(formatDistanceToNow(new Date(cast.timestamp)), 'about ', '')} ago</Text>
                    </View>
                    <Text style={styles.castText}>{cast.text}</Text>
                  </View>
                </View>
              </Link>
            ))}
          </>
        )}
      </ScrollView>
      {thread.length > 0 && <ComposeCast hash={thread[0].hash} />}
    </View>
  );
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
    marginTop: 9
  },
});