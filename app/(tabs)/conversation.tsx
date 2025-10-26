import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LegendList } from '@legendapp/list';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import ComposeCast from '../../components/ComposeCast';
import { useThread } from '../../hooks/queries/useThread';
import { NeynarCast } from '../../lib/neynar/types';

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
  const route = useRoute();
  const hash = route.params?.hash as string;
  const navigation = useNavigation();
  
  const { data: threadData, isLoading, error } = useThread(hash);
  
  // Transform thread data into flat array for rendering
  const thread = useMemo(() => {
    if (!threadData?.conversation) return [];
    
    const { cast, direct_replies } = threadData.conversation;
    const replies = direct_replies || [];
    return [cast, ...replies];
  }, [threadData]);

  const handleBackPress = () => {
    navigation.navigate('index');
  };

  const handleCastPress = (childHash: string) => {
    navigation.setParams({ hash: childHash });
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={{paddingLeft: 15, fontWeight: '300'}}>Back</Text>
        </TouchableOpacity>
      ),
      title: 'Thread',
      headerTitleStyle: {
        color: 'black'
      }
    });
  }, [navigation]);

  const renderCast = ({ item: cast }: { item: NeynarCast }) => {
    const renderImages = () => {
      // Regex to match image URLs
      const regex = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/g;
    
      // Find matches in cast.text
      const textMatches = cast.text.match(regex) || [];
    
      // Extract URLs from cast.embeds
      const embedMatches = cast.embeds
        .filter(embed => embed.url && embed.url.match(regex))
        .map(embed => embed.url);
    
      // Combine and de-duplicate URLs from text and embeds
      const allMatches = Array.from(new Set([...textMatches, ...embedMatches]));
    
      // Render images
      return allMatches.map((url) => (
        <Image key={url} source={{ uri: url }} style={styles.image} />
      ));
    };
    
    return(
      <TouchableOpacity onPress={() => handleCastPress(cast.hash)}>
        <View style={styles.castContainer}>
          <Image source={{ uri: cast.author.pfp_url }} style={styles.pfpImage} />
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.displayName}>{cast.author.display_name}</Text>
              <Text style={styles.timestamp}>{_.replace(formatDistanceToNow(new Date(cast.timestamp)), 'about ', '')} ago</Text>
            </View>
            <Text style={styles.castText}>{cast.text}</Text>
            {renderImages()}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LegendList
          data={thread}
          renderItem={renderCast}
          keyExtractor={item => item.hash}
          recycleItems
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversation found</Text>
            </View>
          )}
        />
        {thread.length > 0 && <ComposeCast hash={thread[0].hash} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
  image: {
    width: 100, // Set your desired image width
    height: 100, // Set your desired image height
    marginRight: 4,
    paddingBottom: 4,
  },
});