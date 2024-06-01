import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { Alert, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import useAppContext from '../hooks/useAppContext';
import FilterList from './FilterComponent';

const HomeHeaderRight = () => {
  const navigation = useNavigation();
  const { fid } = useAppContext();
  const [isSelected, setIsSelected] = useState('home');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const router = useRouter();

  const handlePressNotAvailable = useCallback((section) => {
    Alert.alert('Coming Soon', `${section} section will be available soon.`, [{ onPress: () => console.log('Alert closed'), text: 'Close' }]);
  }, []);

  const handleSelect = useCallback((name) => {
    setIsSelected(name);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <Pressable onPress={() => { handleSelect('home'); router.push(`/(tabs)/channel?type=home&fid=${fid}`); }}>
          <Text style={[styles.linkText, { opacity: isSelected === 'home' ? 1 : 0.4 }]}>Following</Text>
        </Pressable>
        <Pressable onPress={() => { handleSelect('trending'); router.push('/(tabs)/channel?type=trending'); }}>
          <Text style={[styles.linkText, { opacity: isSelected === 'trending' ? 1 : 0.4 }]}>Trending</Text>
        </Pressable>
        <Pressable onPress={() => { handleSelect('filter'); router.push(`/(tabs)/channel?type=channel&fid=${fid}`); }}>
          <Text style={[styles.linkText, { opacity: isSelected === 'filter' ? 1 : 0.4 }]}>Filtered Feed</Text>
        </Pressable>
      </ScrollView>
      <Pressable onPress={() => handlePressNotAvailable('Search')}>
        <FontAwesome name="filter" size={18} color="#565555" style={styles.filterIcon} onPress={() => setFilterVisible(true)} />
      </Pressable>
      <FilterList visible={isFilterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: '2.5%',
    paddingBottom: '2.5%',
    gap: 10,
    width: '100%',
  },
  scrollContainer: {
    flexDirection: 'row',
    marginRight: 10,
    gap: 14,
    width: '100%',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  filterIcon: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 15,
  },
});

export default HomeHeaderRight;