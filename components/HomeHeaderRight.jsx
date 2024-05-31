import { FontAwesome } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { Link, useNavigation } from 'expo-router'
import React from 'react'
import { useEffect, useState } from 'react'
import {
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native'
import { LOCAL_STORAGE_KEYS } from '../constants/Farcaster'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLogin } from 'farcasterkit-react-native'
import FilterList from './FilterComponent'
import useAppContext from '../hooks/useAppContext'

const DEV_CHANNEL_URL = 'https://warpcast.com/~/channel/fbi'
const PURPLE_CHANNEL_URL =
  'chain://eip155:1/erc721:0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60'

const HomeHeaderRight = () => {
  const navigation = useNavigation()
  const currentRoute = useRoute()
  const fontSize = 18
  const { setFarcasterUser } = useLogin()
  const { fid } = useAppContext()
  const [isSelected, setIsSelected] = useState('home')
  // const fid = 616

  const [isFilterVisible, setFilterVisible] = useState(false)

  const handlePressNotAvailable = (section) => {
    Alert.alert('Coming Soon', `${section} section will be available soon.`, [
      { onPress: () => console.log('Alert closed'), text: 'Close' },
    ])
  }

  // this is 90% done but wasn't fully working so commented it out in the meantime
  // todo: add this logic directly to NeynarProvider
  // const handleLogout = () => {
  //   (async () => {
  //     try {
  //       await AsyncStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
  //       setFarcasterUser(null);
  //       router.push('/');
  //     } catch (error) {
  //       console.error("Failed to remove item from AsyncStorage", error);
  //     }
  //   })();
  // }

  // todo: fix this function, it's broken
  // const isSelected = (name) => {
  //   if(currentRoute === null){
  //     return false
  //   }
  //   else{

  //     if(name === 'home' && currentRoute.name === 'channel' && currentRoute.params.type === 'home'){
  //       return true
  //     }
  //     else if(name === 'trending' && currentRoute.name === 'channel' && currentRoute.params.type === 'trending'){
  //       return true
  //     }
  //     else if(name === 'filter' && currentRoute.name === 'channel' && currentRoute.name === 'channel'){
  //       return true
  //     }
  //   }
  //   return false;
  // }

  const handleBackToHome = () => {
    navigation.navigate('home')
  }
  const handleApplyFilters = (fid, channel) => {
    // Apply the filters to your data or update your state here
  }

  const isSelectedHandler = (name) => {
    if (name === isSelected) {
      return true
    } else {
      return false
    }
  }

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        paddingTop: '2.5%',
        paddingBottom: '2.5%',
        width: '100%',
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 24,
          marginRight: 50,
        }}
      >
        <Link
          onPress={() => setIsSelected('home')}
          href={`/(tabs)/channel?type=home&fid=${fid}`}
          asChild
        >
          <Text
            style={{
              fontSize,
              fontWeight: 'normal',
              opacity: isSelectedHandler('home') ? 1 : 0.6,
            }}
          >
            Following
          </Text>
        </Link>
        <Link
          onPress={() => setIsSelected('trending')}
          href="/(tabs)/channel?type=trending"
          asChild
        >
          <Text
            style={{
              fontSize,
              fontWeight: 'normal',
              opacity: isSelectedHandler('trending') ? 1 : 0.6,
            }}
          >
            All People
          </Text>
        </Link>
        {/* <Pressable onPress={() => handlePressNotAvailable('Logout')}>
            <Text style={{ color: 'red', fontSize, fontWeight: 'normal', opacity: 0.7 }}>Logout</Text>
          </Pressable> */}
        <Link
          onPress={() => setIsSelected('filter')}
          href={`/(tabs)/channel?type=channel&fid=${fid}`}
          asChild
        >
          <Text
            style={{
              fontSize,
              fontWeight: 'normal',
              opacity: isSelectedHandler('filter') ? 1 : 0.6,
            }}
          >
            Filtered Feed
          </Text>
        </Link>
      </ScrollView>
      <Pressable onPress={() => handlePressNotAvailable('Search')}>
        <FontAwesome
          name="filter"
          size={18}
          color="#565555"
          style={{ paddingTop: 5, paddingLeft: 10, paddingRight: 15 }}
          onPress={() => setFilterVisible(true)}
        />
      </Pressable>
      <FilterList
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
      />
    </View>
  )
}

export default HomeHeaderRight
