import React, { useCallback, useMemo, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, Image, Platform, StatusBar, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useUser, useUserCasts, useUserReactions } from '@litecast/hooks';
import type { NeynarCast } from '@litecast/types';
import { DEFAULT_FID } from '../constants/Farcaster';
import Cast from '../components/Cast';
import { TabPills } from '../components/TabPills';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import ImageViewer from '../components/ImageViewer';

type TabType = 'casts' | 'recasts' | 'likes';

const tabs: { id: TabType; label: string }[] = [
  { id: 'casts', label: 'Casts' },
  { id: 'recasts', label: 'Recasts' },
  { id: 'likes', label: 'Likes' },
];

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function UsernameProfileScreen() {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  const { username } = useLocalSearchParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('casts');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { data: userData, isLoading: userLoading, error: userError } = useUser(username || '');
  
  const userFid = userData?.user?.fid;
  const { data: castsData, isLoading: castsLoading, fetchNextPage: fetchCastsNextPage, hasNextPage: hasCastsNextPage, isFetchingNextPage: isFetchingCastsNextPage, error: castsError } = 
    useUserCasts({ fid: userFid || 0, includeReplies: false });
  
  const { data: recastsData, isLoading: recastsLoading, fetchNextPage: fetchRecastsNextPage, hasNextPage: hasRecastsNextPage, isFetchingNextPage: isFetchingRecastsNextPage, error: recastsError } = 
    useUserReactions({ fid: userFid || 0, type: 'recasts' });
  
  const { data: likesData, isLoading: likesLoading, fetchNextPage: fetchLikesNextPage, hasNextPage: hasLikesNextPage, isFetchingNextPage: isFetchingLikesNextPage, error: likesError } = 
    useUserReactions({ fid: userFid || 0, type: 'likes' });

  const casts = useMemo(() => {
    if (activeTab === 'casts') {
      return castsData?.pages.flatMap(page => page.casts) ?? [];
    } else if (activeTab === 'recasts') {
      return recastsData?.pages.flatMap(page => page.reactions?.map(r => r.cast) ?? []) ?? [];
    } else {
      return likesData?.pages.flatMap(page => page.reactions?.map(r => r.cast) ?? []) ?? [];
    }
  }, [activeTab, castsData, recastsData, likesData]);

  const onEndReached = useCallback(() => {
    if (activeTab === 'casts' && hasCastsNextPage && !isFetchingCastsNextPage) {
      fetchCastsNextPage();
    } else if (activeTab === 'recasts' && hasRecastsNextPage && !isFetchingRecastsNextPage) {
      fetchRecastsNextPage();
    } else if (activeTab === 'likes' && hasLikesNextPage && !isFetchingLikesNextPage) {
      fetchLikesNextPage();
    }
  }, [activeTab, hasCastsNextPage, isFetchingCastsNextPage, fetchCastsNextPage, hasRecastsNextPage, isFetchingRecastsNextPage, fetchRecastsNextPage, hasLikesNextPage, isFetchingLikesNextPage, fetchLikesNextPage]);

  const isLoading = castsLoading || recastsLoading || likesLoading;
  const isFetchingMore = isFetchingCastsNextPage || isFetchingRecastsNextPage || isFetchingLikesNextPage;
  const user = userData?.user;
  const isOwnProfile = user?.fid === DEFAULT_FID;

  if (userError || castsError || recastsError || likesError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Text style={styles.errorSubtext}>{(userError || castsError || recastsError || likesError)?.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userLoading || !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
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
        {!isOwnProfile && <PageHeader />}
        <View style={styles.container}>
          <View style={styles.profileHeader}>
            <View style={styles.topSection}>
              <TouchableOpacity
                onPress={() => user.pfp_url && setSelectedImage(user.pfp_url)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: user.pfp_url }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.displayName}>{user.display_name}</Text>
                  {user.power_badge && (
                    <FontAwesome name="bolt" size={14} color="#000" />
                  )}
                </View>
                <Text style={styles.username}>@{user.username}</Text>
              </View>
            </View>
            
            {user.profile?.bio?.text && (
              <Text style={styles.bio} numberOfLines={2}>{user.profile.bio.text}</Text>
            )}
            
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                <Text style={styles.statBold}>{formatCount(user.following_count)}</Text>
                <Text style={styles.statGray}> Following</Text>
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.statBold}>{formatCount(user.follower_count)}</Text>
                <Text style={styles.statGray}> Followers</Text>
              </Text>
            </View>
          </View>

          <TabPills 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          <LegendList
            data={casts}
            renderItem={({ item }: { item: NeynarCast }) => <Cast cast={item} truncate={true} />}
            keyExtractor={(item: NeynarCast, index: number) => `${item.hash}-${index}`}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            recycleItems
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            ListFooterComponent={() =>
              isFetchingMore ? (
                <ActivityIndicator size="large" color="#000" style={styles.loader} />
              ) : null
            }
            ListEmptyComponent={() =>
              !isLoading ? (
                <EmptyState 
                  icon={activeTab === 'likes' ? 'heart-o' : activeTab === 'recasts' ? 'retweet' : 'comment-o'}
                  title={`No ${activeTab} yet`}
                  subtitle={
                    activeTab === 'likes' 
                      ? "Casts you like will appear here" 
                      : activeTab === 'recasts' 
                      ? "Recasted content will appear here" 
                      : "Casts will appear here"
                  }
                />
              ) : null
            }
          />
        </View>
      </View>
      
      {/* Full-screen image viewer */}
      <ImageViewer
        visible={selectedImage !== null}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  container: {
    backgroundColor: '#fff',
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    padding: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  username: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 19,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 13,
  },
  statBold: {
    fontWeight: '700',
    color: '#000',
  },
  statGray: {
    color: '#666',
  },
  loader: {
    marginVertical: 20,
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
});

