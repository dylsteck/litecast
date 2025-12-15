import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LiquidGlassTabBar from '../../components/LiquidGlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="channel"
        options={{
          href: null,
          title: '',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
          title: 'Search',
        }}
      />
    </Tabs>
  );
}
