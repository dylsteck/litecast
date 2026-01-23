import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, Platform, StatusBar, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { useRouter } from 'expo-router';
import { useUser, useUserCasts, useUserReactions } from '@litecast/hooks';
import type { NeynarCast } from '@litecast/types';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import Cast from '../../components/Cast';
import { TabPills } from '../../components/TabPills';
import { EmptyState } from '../../components/EmptyState';
import { SystemColors } from '../../constants/Colors';
import ImageViewer from '../../components/ImageViewer';

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

const UserScreen = () => {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  const [activeTab, setActiveTab] = useState<TabType>('casts');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  
  const { data: userData, isLoading: userLoading, error: userError } = useUser(DEFAULT_FID);
  
  useEffect(() => {
    // Don't redirect - keep user profile in tabs so navbar shows
    // The user.tsx tab IS the user's own profile page
  }, []);
  
  // Casts tab
  const { data: castsData, isLoading: castsLoading, fetchNextPage: fetchCastsNextPage, hasNextPage: hasCastsNextPage, isFetchingNextPage: isFetchingCastsNextPage, error: castsError } = 
    useUserCasts({ fid: DEFAULT_FID, includeReplies: false });
  
  // Recasts tab
  const { data: recastsData, isLoading: recastsLoading, fetchNextPage: fetchRecastsNextPage, hasNextPage: hasRecastsNextPage, isFetchingNextPage: isFetchingRecastsNextPage, error: recastsError } = 
    useUserReactions({ fid: DEFAULT_FID, type: 'recasts' });
  
  // Likes tab
  const { data: likesData, isLoading: likesLoading, fetchNextPage: fetchLikesNextPage, hasNextPage: hasLikesNextPage, isFetchingNextPage: isFetchingLikesNextPage, error: likesError } = 
    useUserReactions({ fid: DEFAULT_FID, type: 'likes' });

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
        <View style={styles.container}>
          {/* Profile Header - Posts style */}
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
                    <Ionicons name="flash" size={14} color={SystemColors.label} />
                  )}
                </View>
                {user.profile?.bio?.text && (
                  <Text style={styles.bio} numberOfLines={2}>
                    {user.profile.bio.text}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Stats - inline, smaller */}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                <Text style={styles.statBold}>{formatCount(user.following_count)}</Text>
                <Text style={styles.statLabel}> Following</Text>
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.statBold}>{formatCount(user.follower_count)}</Text>
                <Text style={styles.statLabel}> Followers</Text>
              </Text>
            </View>
          </View>

        {/* Tabs - left aligned, no animation */}
        <TabPills 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          variant="static"
          align="left"
        />

        {/* Content */}
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
              <ActivityIndicator size="small" color={SystemColors.secondaryLabel} style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={() =>
            !isLoading ? (
              <EmptyState 
                icon={activeTab === 'likes' ? 'heart-outline' : activeTab === 'recasts' ? 'repeat-outline' : 'chatbubble-outline'}
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
};

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
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
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
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
      zIndex: 1,
    },
    default: {},
  }),
  container: {
    backgroundColor: SystemColors.background,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: SystemColors.background,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  infoSection: {
    flex: 1,
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  displayName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 20,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.3,
  },
  bio: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  statText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    letterSpacing: -0.1,
  },
  statBold: {
    fontWeight: '600',
    color: SystemColors.label,
  },
  statLabel: {
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: SystemColors.background,
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
    marginBottom: 8,
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
});

export default UserScreen;