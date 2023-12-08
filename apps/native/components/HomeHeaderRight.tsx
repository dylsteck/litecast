import { useNavigation } from 'expo-router';
import React from 'react';
import { Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Link } from 'solito/link';

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 24, paddingBottom: 20, paddingLeft: 75, paddingRight: 0, paddingTop: 5 }}>
        <TouchableOpacity onPress={() => handleBackToHome()}>
          <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected('index') ? 1 : 0.7 }}>Home</Text>
        </TouchableOpacity>
        <Link href={`/page?pageId=trending`} asChild={true}>
            <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected('trending') ? 1 : 0.7 }}>Trending</Text>
        </Link>
        <Link href={`/page?pageId=${DEV_CHANNEL_URL}`} asChild={true}>
          <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected(DEV_CHANNEL_URL) ? 1 : 0.7 }}>/dev</Text>
        </Link>
        <Link href={`/page?pageId=${PURPLE_CHANNEL_URL}`} asChild={true}>
          <Text style={{ fontSize, fontWeight: 'normal', opacity: isSelected(PURPLE_CHANNEL_URL) ? 1 : 0.7 }}>Purple</Text>
        </Link>
        <TouchableOpacity onPress={() => handlePressNotAvailable('Logout')}>
          <Text style={{ color: 'red', fontSize, fontWeight: 'normal', opacity: 0.7 }}>Logout</Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeHeaderRight;