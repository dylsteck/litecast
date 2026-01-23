import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, Text, Platform, StatusBar, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useSearchCasts, useSearchUsers, useSearchFrames } from '@litecast/hooks'
import { useRecentSearches } from '../../hooks/useRecentSearches'
import Cast from '../../components/Cast'
import { SystemColors } from '../../constants/Colors'
import { EmptyState } from '../../components/EmptyState'

const ExploreScreen = () => {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Use separate search hooks
  const castsQuery = useSearchCasts(searchQuery, searchQuery.length > 0)
  const usersQuery = useSearchUsers(searchQuery, searchQuery.length > 0)
  const framesQuery = useSearchFrames(searchQuery, searchQuery.length > 0)
  
  // Extract and sort data from queries
  const casts = useMemo(() => {
    const allCasts = castsQuery.data?.pages.flatMap(page => page.result.casts) ?? [];
    // Sort by Neynar score (descending/highest first)
    return allCasts.sort((a: any, b: any) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      return scoreB - scoreA; // Higher score first
    });
  }, [castsQuery.data]);

  const users = useMemo(() => {
    const allUsers = usersQuery.data?.pages.flatMap(page => page.result.users) ?? [];
    const queryLower = searchQuery.toLowerCase().trim();
    
    // Sort: exact username matches first, then by Neynar score, then by follower_count
    return allUsers.sort((a: any, b: any) => {
      const aUsernameLower = a.username?.toLowerCase() || '';
      const bUsernameLower = b.username?.toLowerCase() || '';
      const aIsExactMatch = aUsernameLower === queryLower;
      const bIsExactMatch = bUsernameLower === queryLower;
      
      // Exact username matches come first
      if (aIsExactMatch && !bIsExactMatch) return -1;
      if (!aIsExactMatch && bIsExactMatch) return 1;
      
      // If both or neither are exact matches, sort by score
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }
      
      // Fallback to follower count
      return (b.follower_count || 0) - (a.follower_count || 0);
    });
  }, [usersQuery.data, searchQuery]);

  const frames = useMemo(() => 
    framesQuery.data?.pages.flatMap(page => page.frames ?? []) ?? [], 
    [framesQuery.data]
  )
  
  const isLoading = castsQuery.isLoading || usersQuery.isLoading || framesQuery.isLoading
  
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches()
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [showAllFrames, setShowAllFrames] = useState(false)

  const hasResults = casts.length > 0 || users.length > 0 || frames.length > 0

  const displayedUsers = showAllUsers ? users : users.slice(0, 3)
  
  // Frames don't have a score, but we can show top results
  const displayedFrames = showAllFrames ? frames : frames.slice(0, 2)

  useEffect(() => {
    if (searchQuery.trim() && hasResults && !isLoading) {
      addRecentSearch(searchQuery)
    }
    // Reset "show more" when search changes
    setShowAllUsers(false)
    setShowAllFrames(false)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim())
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSearchQuery('')
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
          <View style={styles.searchContainer}>
            <Text style={styles.exploreTitle}>Explore</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={SystemColors.secondaryLabel} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={SystemColors.secondaryLabel}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {inputValue.length > 0 && (
                <TouchableOpacity onPress={handleClear} activeOpacity={0.6}>
                  <Ionicons name="close-circle" size={18} color={SystemColors.secondaryLabel} />
                </TouchableOpacity>
              )}
            </View>
          </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={SystemColors.secondaryLabel} />
          </View>
        ) : searchQuery.length > 0 && hasResults ? (
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Users Section */}
            {users.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Users</Text>
                {displayedUsers.map((user) => (
                  <Link key={user.fid} href={user.username ? `/${user.username}` : `/fids/${user.fid}`} asChild>
                    <TouchableOpacity activeOpacity={0.7}>
                      <View style={styles.userItem}>
                        <Image source={{ uri: user.pfp_url }} style={styles.userAvatar} />
                        <View style={styles.userInfo}>
                          <View style={styles.userHeader}>
                            <Text style={styles.userName}>{user.display_name}</Text>
                            {user.power_badge && (
                              <Ionicons name="flash" size={14} color={SystemColors.label} />
                            )}
                          </View>
                          <Text style={styles.userHandle}>@{user.username}</Text>
                          {user.profile?.bio?.text && (
                            <Text style={styles.userBio} numberOfLines={1}>
                              {user.profile.bio.text}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                ))}
                {sortedUsers.length > 3 && !showAllUsers && (
                  <TouchableOpacity 
                    onPress={() => setShowAllUsers(true)}
                    style={styles.viewMoreButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewMoreText}>View more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Casts Section */}
            {casts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Casts</Text>
                {casts.map((cast) => (
                  <Cast key={cast.hash} cast={cast} />
                ))}
              </View>
            )}

            {/* Mini Apps Section */}
            {frames.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mini Apps</Text>
                {displayedFrames.map((frame, index) => {
                  const frameName = frame.name || frame.title || frame.manifest?.frame?.name || frame.manifest?.miniapp?.name || 'Mini App';
                  const frameDescription = frame.description || frame.manifest?.frame?.description || frame.manifest?.miniapp?.description || '';
                  const developer = frame.developer || frame.author;
                  
                  return (
                    <TouchableOpacity key={frame.uuid || frame.frames_url || `frame-${index}`} activeOpacity={0.7}>
                      <View style={styles.frameItem}>
                        <Image source={{ uri: frame.image }} style={styles.frameImage} />
                        <View style={styles.frameInfo}>
                          <Text style={styles.frameName}>{frameName}</Text>
                          {frameDescription && (
                            <Text style={styles.frameDescription} numberOfLines={2}>
                              {frameDescription}
                            </Text>
                          )}
                          {developer && (
                            <View style={styles.frameDeveloper}>
                              <Image 
                                source={{ uri: developer.pfp_url }} 
                                style={styles.developerAvatar} 
                              />
                              <Text style={styles.developerName}>
                                by {developer.display_name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {frames.length > 2 && !showAllFrames && (
                  <TouchableOpacity 
                    onPress={() => setShowAllFrames(true)}
                    style={styles.viewMoreButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewMoreText}>View more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        ) : searchQuery.length > 0 ? (
          <EmptyState 
            icon="search-outline"
            title="No results found"
            subtitle="Try a different search term"
          />
        ) : (
          <ScrollView style={styles.emptyContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.6}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSearch(search)}
                      style={styles.chip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.emptyContent}>
              <EmptyState 
                icon="compass-outline"
                title="Explore Farcaster"
                subtitle="Search for casts, users, and mini apps"
              />
            </View>
          </ScrollView>
        )}
        </View>
      </View>
    </SafeAreaView>
  )
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  exploreTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 28,
    fontWeight: '700',
    color: SystemColors.label,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: SystemColors.secondaryBackground,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.label,
    letterSpacing: -0.1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: -0.2,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.2,
  },
  userHandle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    marginTop: 1,
    letterSpacing: -0.1,
  },
  userBio: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  frameItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  frameImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: SystemColors.secondaryBackground,
  },
  frameInfo: {
    flex: 1,
  },
  frameName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  frameDescription: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    lineHeight: 19,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  frameDeveloper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  developerName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.2,
  },
  clearText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: SystemColors.secondaryBackground,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  chipText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    color: SystemColors.label,
    letterSpacing: -0.1,
  },
  viewMoreButton: {
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  viewMoreText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
})

export default ExploreScreen

