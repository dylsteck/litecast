import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import HomeHeaderLeft from '../../components/HomeHeaderLeft';
import HomeHeaderRight from '../../components/HomeHeaderRight';
import LiquidGlassTabBar from '../../components/LiquidGlassTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          href: null, // Hide from tabs
          title: '',
        }}
      />
      <Tabs.Screen
        name="conversation"
        options={{
          href: null, // Hide from tabs
          title: '',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tabs
          title: 'Search',
        }}
      />
    </Tabs>
  );
}
