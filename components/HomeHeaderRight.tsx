import { FontAwesome } from '@expo/vector-icons';
import { Link, useNavigation } from 'expo-router';
import React from 'react';
import { Text, ScrollView, Alert, TouchableOpacity, View, Pressable } from 'react-native';

const DEV_CHANNEL_URL = 'chain://eip155:1/erc721:0x7dd4e31f1530ac682c8ea4d8016e95773e08d8b0';
const PURPLE_CHANNEL_URL = 'chain://eip155:1/erc721:0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60';

const HomeHeaderRight = () => {
  const navigation = useNavigation();
  const fontSize = 22;

  const handlePressNotAvailable = (section: string) => {
    Alert.alert(
      'Coming Soon',
      `${section} section will be available soon.`,
      [{ onPress: () => console.log('Alert closed'), text: 'Close' }]
    );
  };

  const getCurrentRouteName = () => {
    const navState = navigation.getState();
    if (navState.routes && navState.routes.length > 0) {
      const currentRoute = navState.routes[navState.routes.length - 1];
      return currentRoute;
    }
    return null;
  };
  // todo: fix this function
  const isSelected = (name: string) => {
    const currentRoute = getCurrentRouteName();
    if(currentRoute === null){
      return false
    }
    else{
      if(name === 'index' && currentRoute.name === 'index'){
        return true
      }
      else if(name === 'trending' && currentRoute.name === 'page' && currentRoute.params.pageId === 'trending'){
        return true
      }
      else if(name === DEV_CHANNEL_URL && currentRoute.name === 'page' && currentRoute.params.pageId === DEV_CHANNEL_URL){
        return true
      }
      else if(name === PURPLE_CHANNEL_URL && currentRoute.name === 'page' && currentRoute.params.pageId === PURPLE_CHANNEL_URL){
        return true
      }
    }
    return false;
  }

  const handleBackToHome = () => {
    navigation.navigate('home', {key: ''})
  }

  return (
    <View style={{display: 'flex', flexDirection: 'row', gap: 2, paddingTop: '2.5%', paddingBottom: '2.5%' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 24, marginRight: 50 }}>
          <Link href="/(tabs)" asChild>
            <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected('index') ? 1 : 0.7 }}>Home</Text>
          </Link>
          <Link href="/(tabs)/channel" asChild>
            <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected('trending') ? 1 : 0.7 }}>Trending</Text>
          </Link>
          <Pressable onPress={() => handlePressNotAvailable('/dev')}>
            <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected(DEV_CHANNEL_URL) ? 1 : 0.7 }}>/dev</Text>
          </Pressable>
          <Pressable onPress={() => handlePressNotAvailable('Purple')}>
            <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected(DEV_CHANNEL_URL) ? 1 : 0.7 }}>Purple</Text>
          </Pressable>
          <Pressable onPress={() => handlePressNotAvailable('Logout')}>
            <Text style={{ color: 'red', fontSize, fontWeight: 'normal', opacity: 0.7 }}>Logout</Text>
          </Pressable>
    </ScrollView>
      <Pressable onPress={() => handlePressNotAvailable('Search')}>
        <FontAwesome name="search" size={15} color="#565555" style={{paddingTop: 5, paddingLeft: 10, paddingRight: 15}} />
      </Pressable>
    </View>
  );
};

export default HomeHeaderRight;