import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Button, Host, HStack, ContentUnavailableView } from '@expo/ui/swift-ui';
import { FontAwesome } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { useUser } from '../../hooks/queries/useUser';
import { useUserCasts } from '../../hooks/queries/useUserCasts';
import { useUserReactions } from '../../hooks/queries/useUserReactions';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import Cast from '../../components/Cast';

type TabType = 'casts' | 'recasts' | 'likes';

const tabs: { id: TabType; label: string }[] = [
  { id: 'casts', label: 'Casts' },
  { id: 'recasts', label: 'Recasts' },
  { id: 'likes', label: 'Likes' },
];

const UserScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('casts');
  
  const { data: userData, isLoading: userLoading, error: userError } = useUser(DEFAULT_FID);
  
  // Casts tab
  const { data: castsData, isLoading: castsLoading, fetchNextPage: fetchCastsNextPage, hasNextPage: hasCastsNextPage, isFetchingNextPage: isFetchingCastsNextPage, error: castsError } = 
    useUserCasts(DEFAULT_FID, false);
  
  // Recasts tab
  const { data: recastsData, isLoading: recastsLoading, fetchNextPage: fetchRecastsNextPage, hasNextPage: hasRecastsNextPage, isFetchingNextPage: isFetchingRecastsNextPage, error: recastsError } = 
    useUserReactions(DEFAULT_FID, 'recasts');
  
  // Likes tab
  const { data: likesData, isLoading: likesLoading, fetchNextPage: fetchLikesNextPage, hasNextPage: hasLikesNextPage, isFetchingNextPage: isFetchingLikesNextPage, error: likesError } = 
    useUserReactions(DEFAULT_FID, 'likes');

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Text style={styles.errorSubtext}>{(userError || castsError || recastsError || likesError)?.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userLoading || !user) {
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
        {/* Profile Header - Ultra Compact */}
        <View style={styles.profileHeader}>
          <View style={styles.topSection}>
            <Image
              source={{ uri: user.pfp_url }}
              style={styles.avatar}
            />
            <View style={styles.infoSection}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{user.display_name}</Text>
                {user.power_badge && (
                  <FontAwesome name="bolt" size={14} color="#8B5CF6" />
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
              <Text style={styles.statBold}>{user.following_count.toLocaleString()}</Text>
              <Text style={styles.statGray}> Following</Text>
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.statBold}>{user.follower_count.toLocaleString()}</Text>
              <Text style={styles.statGray}> Followers</Text>
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <Host matchContents>
            <HStack spacing={8}>
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "glassProminent" : "glass"}
                  controlSize="small"
                  onPress={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>
          </Host>
        </View>

        {/* Content */}
        <LegendList
          data={casts}
          renderItem={({ item }) => <Cast cast={item} />}
          keyExtractor={(item) => item.hash}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          recycleItems
          ListFooterComponent={() =>
            isFetchingMore ? (
              <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={() =>
            !isLoading ? (
              <Host style={styles.emptyContainer}>
                <ContentUnavailableView
                  title={`No ${activeTab} yet`}
                  systemImage={
                    activeTab === 'likes' 
                      ? 'heart.slash' 
                      : activeTab === 'recasts' 
                      ? 'arrow.2.squarepath' 
                      : 'bubble.left.and.bubble.right'
                  }
                  description={`${user.display_name} hasn't ${activeTab === 'likes' ? 'liked any casts' : activeTab === 'recasts' ? 'recasted anything' : 'posted any casts'} yet`}
                />
              </Host>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
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
  tabsWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  emptyContainer: {
    flex: 1,
  },
});

export default UserScreen;