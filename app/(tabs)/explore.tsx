import React, { useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, Platform, StatusBar, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { BlurView } from 'expo-blur'
import { FontAwesome } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useSearch } from '../../hooks/queries/useSearch'
import Cast from '../../components/Cast'

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { casts, users, frames, isLoading } = useSearch(searchQuery)

  const hasResults = casts.length > 0 || users.length > 0 || frames.length > 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <BlurView
            intensity={20}
            tint="light"
            style={styles.glassSearchBox}
          >
            <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search casts, users, mini apps..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : searchQuery.length > 0 && hasResults ? (
          <ScrollView style={styles.resultsContainer}>
            {/* Users Section */}
            {users.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Users</Text>
                {users.map((user) => (
                  <Link key={user.fid} href={`/user?fid=${user.fid}`} asChild>
                    <TouchableOpacity>
                      <BlurView intensity={20} tint="light" style={styles.userItem}>
                        <Image source={{ uri: user.pfp_url }} style={styles.userAvatar} />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{user.display_name}</Text>
                          <Text style={styles.userHandle}>@{user.username}</Text>
                          {user.profile?.bio?.text && (
                            <Text style={styles.userBio} numberOfLines={1}>
                              {user.profile.bio.text}
                            </Text>
                          )}
                        </View>
                        {user.power_badge && (
                          <FontAwesome name="bolt" size={14} color="#8B5CF6" />
                        )}
                      </BlurView>
                    </TouchableOpacity>
                  </Link>
                ))}
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
                {frames.map((frame) => (
                  <BlurView key={frame.uuid} intensity={20} tint="light" style={styles.frameItem}>
                    <Image source={{ uri: frame.image }} style={styles.frameImage} />
                    <View style={styles.frameInfo}>
                      <Text style={styles.frameName}>{frame.name}</Text>
                      <Text style={styles.frameDescription} numberOfLines={2}>
                        {frame.description}
                      </Text>
                      <View style={styles.frameDeveloper}>
                        <Image 
                          source={{ uri: frame.developer.pfp_url }} 
                          style={styles.developerAvatar} 
                        />
                        <Text style={styles.developerName}>
                          by {frame.developer.display_name}
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                ))}
              </View>
            )}
          </ScrollView>
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={48} color="#DDD" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={48} color="#DDD" />
            <Text style={styles.emptyText}>Search</Text>
            <Text style={styles.emptySubtext}>Find casts, users, and mini apps</Text>
          </View>
        )}
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
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  searchContainer: {
    padding: 12,
  },
  glassSearchBox: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 16,
    marginBottom: 12,
  },
  userItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  frameItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
  },
  frameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  frameInfo: {
    flex: 1,
  },
  frameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  frameDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
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
  },
  developerName: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
})

export default ExploreScreen

